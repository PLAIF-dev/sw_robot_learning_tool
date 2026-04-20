using Microsoft.AspNetCore.Mvc;
using RobotLearningTool.Application.Dtos;
using RobotLearningTool.Application.Interfaces;

namespace RobotLearningTool.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        var token = await _authService.LoginAsync(request.Password);
        if (token is null)
        {
            return Unauthorized(new
            {
                error = new
                {
                    code = "UNAUTHORIZED",
                    message = "비밀번호가 올바르지 않습니다."
                }
            });
        }

        return Ok(new LoginResponseDto(token, "로그인에 성공했습니다."));
    }

    [HttpGet("status")]
    public async Task<IActionResult> Status()
    {
        var token = ExtractToken();
        if (token is null)
        {
            return Ok(new AuthStatusDto(false, "인증 토큰이 없습니다."));
        }

        var isAuthenticated = await _authService.ValidateTokenAsync(token);
        return Ok(new AuthStatusDto(isAuthenticated, isAuthenticated ? "인증됨" : "세션이 만료되었습니다."));
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var token = ExtractToken();
        if (token is not null)
        {
            await _authService.LogoutAsync(token);
        }

        return Ok(new { message = "로그아웃했습니다." });
    }

    private string? ExtractToken()
    {
        var header = Request.Headers.Authorization.FirstOrDefault();
        if (header is not null && header.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return header["Bearer ".Length..];
        }

        return null;
    }
}
