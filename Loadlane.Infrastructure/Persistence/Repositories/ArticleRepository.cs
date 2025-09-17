using Infrastructure.Context;
using Loadlane.Application.Abstractions.Persistence;
using Loadlane.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Loadlane.Infrastructure.Persistence.Repositories;

public sealed class ArticleRepository : IArticleRepository
{
    private readonly AppDbContext _context;

    public ArticleRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Article article, CancellationToken cancellationToken = default)
    {
        await _context.Articles.AddAsync(article, cancellationToken);
    }

    public async Task<Article?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await _context.Articles
            .FirstOrDefaultAsync(a => a.Name == name, cancellationToken);
    }
}