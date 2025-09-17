namespace Application.Logging
{
    public interface ILoggerManager
    {
        void LogInfo(string message, object? metadata = null);
        void LogWarn(string message, object? metadata = null);
        void LogDebug(string message, object? metadata = null);
        void LogError(string message, object? metadata = null);

        IDisposable BeginScope(Dictionary<string, object> metadata);
    }
}