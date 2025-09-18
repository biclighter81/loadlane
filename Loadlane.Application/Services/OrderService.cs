using Application.Services;
using Loadlane.Application.Abstractions.Persistence;
using Loadlane.Application.DTOs;
using Loadlane.Domain.Entities;

namespace Loadlane.Application.Services;

public interface IOrderService
{
    Task<OrderResponseDto> CreateOrderAsync(CreateOrderDto createOrderDto, CancellationToken cancellationToken = default);
    Task<OrderResponseDto?> GetOrderByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<OrderResponseDto>> GetAllOrdersAsync(CancellationToken cancellationToken = default);
    Task<List<OrderResponseDto>> GetAllOrdersAsync(bool? includeCompleted, CancellationToken cancellationToken = default);
    Task UpdateTransportStatusAsync(string transportId, Domain.Enums.TransportStatus status, CancellationToken cancellationToken = default);
    Task MarkTransportAsArrivedAsync(string transportId, CancellationToken cancellationToken = default);
    Task HandleTransportArrivalAsync(string transportId, double currentLatitude, double currentLongitude, CancellationToken cancellationToken = default);
}

public sealed class OrderService : IOrderService
{
    private readonly DirectionsService _directions;
    private readonly IOrderRepository _orderRepository;
    private readonly ILocationRepository _locationRepository;
    private readonly IArticleRepository _articleRepository;
    private readonly ICarrierRepository _carrierRepository;
    private readonly IWarehouseRepository _warehouseRepository;
    private readonly IUnitOfWork _unitOfWork;

    public OrderService(
        DirectionsService directions,
        IOrderRepository orderRepository,
        ILocationRepository locationRepository,
        IArticleRepository articleRepository,
        ICarrierRepository carrierRepository,
        IWarehouseRepository warehouseRepository,
        IUnitOfWork unitOfWork)
    {
        _directions = directions;
        _orderRepository = orderRepository;
        _locationRepository = locationRepository;
        _articleRepository = articleRepository;
        _carrierRepository = carrierRepository;
        _warehouseRepository = warehouseRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<OrderResponseDto> CreateOrderAsync(CreateOrderDto createOrderDto, CancellationToken cancellationToken = default)
    {
        // Check if order with external order number already exists
        if (await _orderRepository.ExistsByExtOrderNoAsync(createOrderDto.ExtOrderNo, cancellationToken))
        {
            throw new InvalidOperationException($"Order with external order number '{createOrderDto.ExtOrderNo}' already exists.");
        }

        // Create or get existing entities
        var article = await GetOrCreateArticleAsync(createOrderDto.Article, cancellationToken);
        var carrier = await GetOrCreateCarrierAsync(createOrderDto.Carrier, cancellationToken);
        var startLocation = await GetOrCreateLocationAsync(createOrderDto.StartLocation, cancellationToken);
        var destinationLocation = await GetOrCreateLocationAsync(createOrderDto.DestinationLocation, cancellationToken);

        // Create start and destination waypoints
        var start = Start.Create(startLocation, createOrderDto.PlannedDeparture);
        var destination = Destination.Create(destinationLocation, createOrderDto.PlannedArrival);

        // Create order
        var order = new Order(createOrderDto.ExtOrderNo, createOrderDto.Quantity, article);

        // Generate dynamic transport ID
        var transportId = $"transp_{Guid.NewGuid().ToString().Substring(0, 8)}";

        // Create transport
        var transport = new Transport(transportId, order);
        transport.SetRoute(start, destination);
        transport.SetCarrier(carrier);

        // Add stopps if provided
        if (createOrderDto.Stopps?.Any() == true)
        {
            foreach (var stoppDto in createOrderDto.Stopps.OrderBy(s => s.SequenceNumber))
            {
                var stoppLocation = await GetOrCreateLocationAsync(stoppDto.Location, cancellationToken);
                var stopp = Stopp.Create(stoppLocation, stoppDto.SequenceNumber, stoppDto.PlannedArrival);
                transport.AddStopp(stopp);
            }

            // Set up next stopp chain
            var orderedStopps = transport.Stopps.OrderBy(s => s.SequenceNumber).ToList();
            for (int i = 0; i < orderedStopps.Count - 1; i++)
            {
                orderedStopps[i].SetNextStopp(orderedStopps[i + 1]);
            }
        }

        // Add transport to order
        order.AddTransport(transport);

        // Generate directions for the transport route
        var waypoints = transport.Stopps?.Select(s => (s.Location.Longitude, s.Location.Latitude)) ?? Enumerable.Empty<(double, double)>();
        var route = await _directions.GetOrCreateRouteWithWaypointsAsync(
            (startLocation.Longitude, startLocation.Latitude),
            (destinationLocation.Longitude, destinationLocation.Latitude),
            waypoints);

        // Extract the cache key from the route generation
        var waypointsList = waypoints.ToList();
        var waypointsStr = waypointsList.Count > 0
            ? string.Join("|", waypointsList.Select(w => $"{w.Item1:F6},{w.Item2:F6}"))
            : "none";
        var cacheKey = $"route:driving:{startLocation.Longitude:F6},{startLocation.Latitude:F6}->{destinationLocation.Longitude:F6},{destinationLocation.Latitude:F6}:waypoints:{waypointsStr}";
        order.SetDirectionsCacheKey(cacheKey);

        // Save to database
        await _orderRepository.AddAsync(order, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Map to response DTO
        return MapToResponseDto(order);
    }

    public async Task<OrderResponseDto?> GetOrderByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var order = await _orderRepository.GetByIdAsync(id, cancellationToken);
        return order != null ? MapToResponseDto(order) : null;
    }

    public async Task<List<OrderResponseDto>> GetAllOrdersAsync(CancellationToken cancellationToken = default)
    {
        var orders = await _orderRepository.GetAllAsync(cancellationToken);
        return orders.Select(MapToResponseDto).ToList();
    }

    public async Task<List<OrderResponseDto>> GetAllOrdersAsync(bool? includeCompleted, CancellationToken cancellationToken = default)
    {
        var orders = await _orderRepository.GetAllAsync(cancellationToken);

        if (includeCompleted == false)
        {
            // Filter out completed orders (check if any transport is completed)
            orders = orders.Where(o => !o.Transports.Any(t => t.Status == Domain.Enums.TransportStatus.Completed)).ToList();
        }

        return orders.Select(MapToResponseDto).ToList();
    }

    public async Task UpdateTransportStatusAsync(string transportId, Domain.Enums.TransportStatus status, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(transportId))
            throw new ArgumentException("TransportId cannot be null or empty", nameof(transportId));

        // Find order by scanning through all orders and their transports
        var orders = await _orderRepository.GetAllAsync(cancellationToken);
        var order = orders.FirstOrDefault(o => o.Transports.Any(t => t.TransportId == transportId));

        if (order == null)
            throw new InvalidOperationException($"Order with transportId '{transportId}' not found");

        var transport = order.Transports.First(t => t.TransportId == transportId);

        // Use the appropriate method based on the target status
        switch (status)
        {
            case Domain.Enums.TransportStatus.InProgress:
                transport.StartTransport();
                break;
            case Domain.Enums.TransportStatus.Completed:
                transport.Complete();
                break;
            case Domain.Enums.TransportStatus.Cancelled:
                transport.Cancel();
                break;
            default:
                throw new InvalidOperationException($"Cannot update transport to status '{status}' using this method");
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task MarkTransportAsArrivedAsync(string transportId, CancellationToken cancellationToken = default)
    {
        var orders = await _orderRepository.GetAllAsync(cancellationToken);
        var order = orders.FirstOrDefault(o => o.Transports.Any(t => t.TransportId == transportId));

        if (order == null)
            throw new InvalidOperationException($"Order with transportId '{transportId}' not found");

        var transport = order.Transports.First(t => t.TransportId == transportId);
        transport.Complete(); // Use Complete instead of MarkAsArrived

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task HandleTransportArrivalAsync(string transportId, double currentLatitude, double currentLongitude, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(transportId))
            throw new ArgumentException("TransportId cannot be null or empty", nameof(transportId));

        // Find the order and transport
        var orders = await _orderRepository.GetAllAsync(cancellationToken);
        var order = orders.FirstOrDefault(o => o.Transports.Any(t => t.TransportId == transportId));

        if (order == null)
            throw new InvalidOperationException($"Order with transportId '{transportId}' not found");

        var transport = order.Transports.First(t => t.TransportId == transportId);

        // Check if we've arrived at a warehouse
        var warehouse = await _warehouseRepository.GetByLocationAsync(currentLatitude, currentLongitude, 200, cancellationToken);

        if (warehouse != null)
        {
            Console.WriteLine($"Transport {transportId} arrived at warehouse: {warehouse.Name}");

            // Determine which waypoint we've arrived at
            var currentWaypoint = DetermineCurrentWaypoint(transport, currentLatitude, currentLongitude);

            if (currentWaypoint != null)
            {
                // Record arrival time
                currentWaypoint.RecordArrival(DateTime.UtcNow);
                Console.WriteLine($"Recorded arrival at waypoint with location: {currentWaypoint.Location.City}");

                // Check if warehouse has gates
                if (warehouse.Gates.Any(g => g.IsActive))
                {
                    // Set status to waiting for gate assignment
                    transport.SetWaiting();
                    Console.WriteLine($"Transport {transportId} is waiting for gate assignment at {warehouse.Name}");
                }
                else
                {
                    // No gates, complete the waypoint immediately
                    transport.Complete();
                    Console.WriteLine($"Transport {transportId} completed arrival at {warehouse.Name} (no gates)");
                }
            }
        }
        else
        {
            // Not at a warehouse, complete the transport
            transport.Complete();
            Console.WriteLine($"Transport {transportId} completed - not at a recognized warehouse location");
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private Waypoint? DetermineCurrentWaypoint(Transport transport, double currentLatitude, double currentLongitude)
    {
        var tolerance = 0.002; // ~200 meters tolerance in degrees

        // Check destination first
        if (transport.Destination != null &&
            IsLocationMatch(transport.Destination.Location, currentLatitude, currentLongitude, tolerance))
        {
            return transport.Destination;
        }

        // Check stopps
        foreach (var stopp in transport.Stopps.OrderBy(s => s.SequenceNumber))
        {
            if (IsLocationMatch(stopp.Location, currentLatitude, currentLongitude, tolerance))
            {
                return stopp;
            }
        }

        return null;
    }

    private bool IsLocationMatch(Location location, double currentLatitude, double currentLongitude, double tolerance)
    {
        return Math.Abs(location.Latitude - currentLatitude) <= tolerance &&
               Math.Abs(location.Longitude - currentLongitude) <= tolerance;
    }

    private async Task<Article> GetOrCreateArticleAsync(ArticleDto articleDto, CancellationToken cancellationToken)
    {
        var existingArticle = await _articleRepository.GetByNameAsync(articleDto.Name, cancellationToken);
        if (existingArticle != null)
        {
            return existingArticle;
        }

        var article = new Article(articleDto.Name, articleDto.Description);
        if (articleDto.Weight.HasValue && articleDto.Volume.HasValue)
        {
            article.SetDimensions(articleDto.Weight.Value, articleDto.Volume.Value);
        }

        await _articleRepository.AddAsync(article, cancellationToken);
        return article;
    }

    private async Task<Carrier> GetOrCreateCarrierAsync(CarrierDto carrierDto, CancellationToken cancellationToken)
    {
        var existingCarrier = await _carrierRepository.GetByNameAsync(carrierDto.Name, cancellationToken);
        if (existingCarrier != null)
        {
            return existingCarrier;
        }

        var carrier = new Carrier(carrierDto.Name, carrierDto.ContactEmail, carrierDto.ContactPhone);
        await _carrierRepository.AddAsync(carrier, cancellationToken);
        return carrier;
    }

    private async Task<Location> GetOrCreateLocationAsync(LocationDto locationDto, CancellationToken cancellationToken)
    {
        var existingLocation = await _locationRepository.GetByCoordinatesAsync(
            locationDto.Latitude,
            locationDto.Longitude,
            cancellationToken);

        if (existingLocation != null)
        {
            return existingLocation;
        }

        var location = new Location(
            locationDto.City,
            locationDto.Street,
            locationDto.HouseNo,
            locationDto.PostCode,
            locationDto.Latitude,
            locationDto.Longitude);

        await _locationRepository.AddAsync(location, cancellationToken);
        return location;
    }

    private static OrderResponseDto MapToResponseDto(Order order)
    {
        var transport = order.Transports.First();

        return new OrderResponseDto(
            order.Id,
            order.ExtOrderNo,
            order.Quantity,
            new ArticleResponseDto(
                order.Article.Id,
                order.Article.Name,
                order.Article.Description,
                order.Article.Weight,
                order.Article.Volume,
                order.Article.CreatedUtc),
            new TransportResponseDto(
                transport.Id,
                transport.TransportId,
                transport.Status,
                transport.Carrier != null ? MapCarrierResponse(transport.Carrier) : null,
                transport.Start != null ? MapLocationResponse(transport.Start.Location) : null,
                transport.Destination != null ? MapLocationResponse(transport.Destination.Location) : null,
                transport.Stopps.Select(s => new StoppResponseDto(
                    s.Id,
                    s.SequenceNumber,
                    s.PlannedArrival,
                    s.ActualArrival,
                    MapLocationResponse(s.Location))).ToList(),
                transport.CreatedUtc),
            order.DirectionsCacheKey,
            order.CreatedUtc);
    }

    private static LocationResponseDto MapLocationResponse(Location location)
    {
        return new LocationResponseDto(
            location.Id,
            location.City,
            location.Street,
            location.HouseNo,
            location.PostCode,
            location.Latitude,
            location.Longitude);
    }

    private static CarrierResponseDto MapCarrierResponse(Carrier carrier)
    {
        return new CarrierResponseDto(
            carrier.Id,
            carrier.Name,
            carrier.ContactEmail,
            carrier.ContactPhone,
            carrier.CreatedUtc);
    }
}