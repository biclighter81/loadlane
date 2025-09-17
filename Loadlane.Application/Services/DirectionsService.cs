using Application.Logging;

namespace Application.Services;

public class DirectionsService
{
    private readonly ILoggerManager _logger;
    public DirectionsService(
        ILoggerManager logger
    )
    {
        _logger = logger;
    }
}