namespace Loadlane.Application.DTOs;

public sealed record ArticleDto(
    string Name,
    string? Description = null,
    decimal? Weight = null,
    decimal? Volume = null
);

public sealed record CreateArticleDto(
    string Name,
    string? Description = null,
    decimal? Weight = null,
    decimal? Volume = null
);

public sealed record UpdateArticleDto(
    string Name,
    string? Description = null,
    decimal? Weight = null,
    decimal? Volume = null
);

public sealed record ArticleResponseDto(
    Guid Id,
    string Name,
    string? Description,
    decimal? Weight,
    decimal? Volume,
    DateTime CreatedUtc
);