namespace RobotLearningTool.Application.Dtos;

public record LoginRequestDto(string Password);
public record LoginResponseDto(string Token, string Message);
public record AuthStatusDto(bool IsAuthenticated, string? Message);
