using Microsoft.AspNetCore.Mvc;
using RobotLearningTool.Application.Interfaces;

namespace RobotLearningTool.Api.Controllers;

[ApiController]
[Route("api/cameras")]
public class CamerasController : ControllerBase
{
    private readonly ICameraService _cameraService;

    public CamerasController(ICameraService cameraService)
    {
        _cameraService = cameraService;
    }

    [HttpGet("channels")]
    public async Task<IActionResult> GetChannels()
    {
        return Ok(await _cameraService.GetChannelsAsync());
    }

    [HttpGet("{channel}/frame")]
    public async Task<IActionResult> GetFrame(string channel)
    {
        var frame = await _cameraService.GetFrameBase64Async(channel);
        return Ok(new
        {
            channel,
            frame,
            timestamp = DateTimeOffset.UtcNow
        });
    }

    [HttpGet("{channel}/frames")]
    public async Task<IActionResult> GetFrames(string channel)
    {
        var frame = await _cameraService.GetFrameBase64Async(channel);
        return Ok(Enumerable.Range(0, 6).Select(index => new
        {
            channel,
            frame,
            timestamp = DateTimeOffset.UtcNow.AddMilliseconds(-index * 250)
        }));
    }

    [HttpGet("{channel}/settings")]
    public async Task<IActionResult> GetSettings(string channel)
    {
        return Ok(await _cameraService.GetSettingsAsync(channel));
    }

    [HttpPut("{channel}/settings")]
    public async Task<IActionResult> UpdateSettings(string channel, [FromBody] UpdateSettingsRequest request)
    {
        await _cameraService.UpdateSettingsAsync(channel, request.Width, request.Height, request.Fps);
        return Ok(new { message = "채널 설정을 저장했습니다." });
    }

    public record UpdateSettingsRequest(int Width, int Height, int Fps);
}
