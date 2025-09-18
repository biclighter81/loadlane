using Loadlane.Domain.Entities;

namespace Loadlane.Application.Abstractions.Persistence;

public interface IWaypointRepository
{
    /// <summary>
    /// Gets all waypoints associated with a specific transport
    /// </summary>
    /// <param name="transportId">The ID of the transport</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of waypoints for the transport</returns>
    Task<List<Waypoint>> GetByTransportIdAsync(Guid transportId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a waypoint by its ID
    /// </summary>
    /// <param name="id">The waypoint ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The waypoint if found, null otherwise</returns>
    Task<Waypoint?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates waypoint properties including actual arrival, actual departure, and gate assignment
    /// </summary>
    /// <param name="waypointId">The waypoint ID</param>
    /// <param name="actualArrival">The actual arrival time (optional)</param>
    /// <param name="actualDeparture">The actual departure time (optional)</param>
    /// <param name="gate">The gate to assign (optional)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if updated successfully, false if waypoint not found</returns>
    Task<bool> UpdateWaypointAsync(Guid waypointId, DateTime? actualArrival = null, Gate? gate = null, CancellationToken cancellationToken = default);
}