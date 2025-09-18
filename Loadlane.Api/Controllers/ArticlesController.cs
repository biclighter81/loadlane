using Loadlane.Application.DTOs;
using Loadlane.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Loadlane.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ArticlesController : ControllerBase
{
    private readonly ArticleService _articleService;

    public ArticlesController(ArticleService articleService)
    {
        _articleService = articleService;
    }

    /// <summary>
    /// Get all articles
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<ArticleResponseDto>>> GetAllArticles(CancellationToken cancellationToken = default)
    {
        try
        {
            var articles = await _articleService.GetAllArticlesAsync(cancellationToken);
            return Ok(articles);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching articles.", error = ex.Message });
        }
    }

    /// <summary>
    /// Get article by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ArticleResponseDto>> GetArticleById(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var article = await _articleService.GetArticleByIdAsync(id, cancellationToken);
            if (article == null)
            {
                return NotFound(new { message = $"Article with ID '{id}' not found." });
            }

            return Ok(article);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching the article.", error = ex.Message });
        }
    }

    /// <summary>
    /// Create a new article
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ArticleResponseDto>> CreateArticle([FromBody] CreateArticleDto createDto, CancellationToken cancellationToken = default)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var article = await _articleService.CreateArticleAsync(createDto, cancellationToken);
            return CreatedAtAction(nameof(GetArticleById), new { id = article.Id }, article);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating the article.", error = ex.Message });
        }
    }

    /// <summary>
    /// Update an existing article
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ArticleResponseDto>> UpdateArticle(Guid id, [FromBody] UpdateArticleDto updateDto, CancellationToken cancellationToken = default)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var article = await _articleService.UpdateArticleAsync(id, updateDto, cancellationToken);
            return Ok(article);
        }
        catch (InvalidOperationException ex)
        {
            if (ex.Message.Contains("not found"))
            {
                return NotFound(new { message = ex.Message });
            }
            return Conflict(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating the article.", error = ex.Message });
        }
    }

    /// <summary>
    /// Delete an article
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteArticle(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            await _articleService.DeleteArticleAsync(id, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while deleting the article.", error = ex.Message });
        }
    }
}