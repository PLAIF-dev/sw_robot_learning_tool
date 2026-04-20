namespace RobotLearningTool.Application.Interfaces;

public interface IAuthService
{
    Task<string?> LoginAsync(string password);
    Task<bool> ValidateTokenAsync(string token);
    Task LogoutAsync(string token);
}
