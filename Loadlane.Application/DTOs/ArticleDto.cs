namespace Loadlane.Application.DTOs;

public sealed record ArticleDto(
    string Name,
    string? Description = null,
    decimal? Weight = null,
    decimal? Volume = null
);