using Loadlane.Domain.Entities;

namespace Loadlane.Application.Abstractions.Persistence;

public interface IArticleRepository
{
    Task AddAsync(Article article, CancellationToken cancellationToken = default);
    Task<Article?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
}