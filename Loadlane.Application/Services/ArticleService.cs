using Loadlane.Application.Abstractions.Persistence;
using Loadlane.Application.DTOs;
using Loadlane.Domain.Entities;

namespace Loadlane.Application.Services;

public sealed class ArticleService
{
    private readonly IArticleRepository _articleRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ArticleService(IArticleRepository articleRepository, IUnitOfWork unitOfWork)
    {
        _articleRepository = articleRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<List<ArticleResponseDto>> GetAllArticlesAsync(CancellationToken cancellationToken = default)
    {
        var articles = await _articleRepository.GetAllAsync(cancellationToken);
        return articles.Select(MapToResponseDto).ToList();
    }

    public async Task<ArticleResponseDto?> GetArticleByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var article = await _articleRepository.GetByIdAsync(id, cancellationToken);
        return article != null ? MapToResponseDto(article) : null;
    }

    public async Task<ArticleResponseDto> CreateArticleAsync(CreateArticleDto createDto, CancellationToken cancellationToken = default)
    {
        // Check if article with same name already exists
        var existingArticle = await _articleRepository.GetByNameAsync(createDto.Name, cancellationToken);
        if (existingArticle != null)
        {
            throw new InvalidOperationException($"An article with the name '{createDto.Name}' already exists.");
        }

        var article = new Article(createDto.Name, createDto.Description);

        if (createDto.Weight.HasValue || createDto.Volume.HasValue)
        {
            article.SetDimensions(createDto.Weight ?? 0, createDto.Volume ?? 0);
        }

        await _articleRepository.AddAsync(article, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToResponseDto(article);
    }

    public async Task<ArticleResponseDto> UpdateArticleAsync(Guid id, UpdateArticleDto updateDto, CancellationToken cancellationToken = default)
    {
        var article = await _articleRepository.GetByIdAsync(id, cancellationToken);
        if (article == null)
        {
            throw new InvalidOperationException($"Article with ID '{id}' not found.");
        }

        // Check if another article with the same name exists (excluding current article)
        var nameExists = await _articleRepository.ExistsByNameAsync(updateDto.Name, id, cancellationToken);
        if (nameExists)
        {
            throw new InvalidOperationException($"An article with the name '{updateDto.Name}' already exists.");
        }

        article.UpdateDetails(updateDto.Name, updateDto.Description);

        if (updateDto.Weight.HasValue || updateDto.Volume.HasValue)
        {
            article.SetDimensions(updateDto.Weight ?? 0, updateDto.Volume ?? 0);
        }

        await _articleRepository.UpdateAsync(article, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapToResponseDto(article);
    }

    public async Task DeleteArticleAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var article = await _articleRepository.GetByIdAsync(id, cancellationToken);
        if (article == null)
        {
            throw new InvalidOperationException($"Article with ID '{id}' not found.");
        }

        await _articleRepository.DeleteAsync(id, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static ArticleResponseDto MapToResponseDto(Article article)
    {
        return new ArticleResponseDto(
            article.Id,
            article.Name,
            article.Description,
            article.Weight,
            article.Volume,
            article.CreatedUtc
        );
    }
}