using Infrastructure.Context;
using Loadlane.Application.Abstractions.Persistence;
using Loadlane.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Loadlane.Infrastructure.Persistence.Repositories;

public sealed class OrderRepository : IOrderRepository
{
    private readonly AppDbContext _context;

    public OrderRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Order order, CancellationToken cancellationToken = default)
    {
        await _context.Orders.AddAsync(order, cancellationToken);
    }

    public async Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Orders
            .Include(o => o.Article)
            .Include(o => o.Transports)
                .ThenInclude(t => t.Carrier)
            .Include(o => o.Transports)
                .ThenInclude(t => t.Start)
                    .ThenInclude(s => s!.Location)
            .Include(o => o.Transports)
                .ThenInclude(t => t.Destination)
                    .ThenInclude(d => d!.Location)
            .Include(o => o.Transports)
                .ThenInclude(t => t.Stopps)
                    .ThenInclude(s => s.Location)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
    }

    public async Task<List<Order>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Orders
            .Include(o => o.Article)
            .Include(o => o.Transports)
                .ThenInclude(t => t.Carrier)
            .Include(o => o.Transports)
                .ThenInclude(t => t.Start)
                    .ThenInclude(s => s!.Location)
            .Include(o => o.Transports)
                .ThenInclude(t => t.Destination)
                    .ThenInclude(d => d!.Location)
            .Include(o => o.Transports)
                .ThenInclude(t => t.Stopps)
                    .ThenInclude(s => s.Location)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsByExtOrderNoAsync(string extOrderNo, CancellationToken cancellationToken = default)
    {
        return await _context.Orders.AnyAsync(o => o.ExtOrderNo == extOrderNo, cancellationToken);
    }
}