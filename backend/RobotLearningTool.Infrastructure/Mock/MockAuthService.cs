using RobotLearningTool.Application.Interfaces;

namespace RobotLearningTool.Infrastructure.Mock;

public class MockAuthService : IAuthService
{
    private readonly string _password;
    private readonly Dictionary<string, DateTimeOffset> _tokens = new();

    public MockAuthService(string password)
    {
        _password = password;
    }

    public Task<string?> LoginAsync(string password)
    {
        if (password != _password)
        {
            return Task.FromResult<string?>(null);
        }

        var token = Guid.NewGuid().ToString("N");
        _tokens[token] = DateTimeOffset.UtcNow.AddHours(12);
        return Task.FromResult<string?>(token);
    }

    public Task<bool> ValidateTokenAsync(string token)
    {
        return Task.FromResult(
            _tokens.TryGetValue(token, out var expiresAt) &&
            expiresAt > DateTimeOffset.UtcNow);
    }

    public Task LogoutAsync(string token)
    {
        _tokens.Remove(token);
        return Task.CompletedTask;
    }
}
