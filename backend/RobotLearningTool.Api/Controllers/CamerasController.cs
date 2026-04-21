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
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public async Task<IActionResult> GetFrame(string channel)
    {
        var frame = await _cameraService.GetFrameAsync(channel);
        Response.Headers.CacheControl = "no-store, no-cache, must-revalidate";
        Response.Headers.Pragma = "no-cache";
        Response.Headers.Expires = "0";
        Response.Headers["X-Frame-Index"] = frame.FrameIndex.ToString();
        Response.Headers["X-Frame-Channel"] = frame.Channel;
        return File(frame.Content, frame.ContentType);
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
        return Ok(new { message = "카메라 설정을 업데이트했습니다." });
    }

    public record UpdateSettingsRequest(int Width, int Height, int Fps);
}
