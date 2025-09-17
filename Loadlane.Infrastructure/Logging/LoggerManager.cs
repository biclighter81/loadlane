using Application.Logging;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Logging;

public class LoggerManager : ILoggerManager
{
    private readonly ILogger<LoggerManager> _logger;

    public LoggerManager(ILogger<LoggerManager> logger)
    {
        _logger = logger;
    }

    public void LogInfo(string message, object? metadata = null)
    {
        if (metadata != null)
            _logger.LogInformation("{Message} {@Metadata}", message, metadata);
        else
            _logger.LogInformation(message);
    }

    public void LogWarn(string message, object? metadata = null)
    {
        if (metadata != null)
            _logger.LogWarning("{Message} {@Metadata}", message, metadata);
        else
            _logger.LogWarning(message);
    }

    public void LogDebug(string message, object? metadata = null)
    {
        if (metadata != null)
            _logger.LogDebug("{Message} {@Metadata}", message, metadata);
        else
            _logger.LogDebug(message);
    }

    public void LogError(string message, object? metadata = null)
    {
        if (metadata != null)
            _logger.LogError("{Message} {@Metadata}", message, metadata);
        else
            _logger.LogError(message);
    }

    public IDisposable BeginScope(Dictionary<string, object> metadata)
    {
        return _logger.BeginScope(metadata)!;
    }
}