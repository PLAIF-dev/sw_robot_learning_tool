using Microsoft.AspNetCore.Mvc;
using RobotLearningTool.Application.Dtos;
using RobotLearningTool.Application.Interfaces;

namespace RobotLearningTool.Api.Controllers;

[ApiController]
[Route("api/devices")]
public class DevicesController : ControllerBase
{
    private readonly IDeviceService _deviceService;
    private readonly ICameraService _cameraService;

    public DevicesController(IDeviceService deviceService, ICameraService cameraService)
    {
        _deviceService = deviceService;
        _cameraService = cameraService;
    }

    [HttpGet("status")]
    public async Task<IActionResult> GetStatus()
    {
        var status = await _deviceService.GetStatusAsync();
        var dto = new DeviceStatusDto(
            new RobotStatusDto(status.LeftArm.Connected, status.LeftArm.State, status.LeftArm.HandGuideMode),
            new RobotStatusDto(status.RightArm.Connected, status.RightArm.State, status.RightArm.HandGuideMode),
            new ControllerStatusDto(status.Controller.Connected, status.Controller.State),
            new CameraStatusDto(status.LeftCamera.Connected, status.LeftCamera.Channel, status.LeftCamera.Width, status.LeftCamera.Height, status.LeftCamera.Fps),
            new CameraStatusDto(status.RightCamera.Connected, status.RightCamera.Channel, status.RightCamera.Width, status.RightCamera.Height, status.RightCamera.Fps),
            new CameraStatusDto(status.HeadCamera.Connected, status.HeadCamera.Channel, status.HeadCamera.Width, status.HeadCamera.Height, status.HeadCamera.Fps),
            new GripperStatusDto(status.LeftGripper.Connected, status.LeftGripper.OpenPercent),
            new GripperStatusDto(status.RightGripper.Connected, status.RightGripper.OpenPercent));

        return Ok(dto);
    }

    [HttpGet("robots")]
    public async Task<IActionResult> GetRobots()
    {
        var status = await _deviceService.GetStatusAsync();
        return Ok(new
        {
            left = status.LeftArm,
            right = status.RightArm
        });
    }

    [HttpGet("controllers")]
    public async Task<IActionResult> GetControllers()
    {
        var status = await _deviceService.GetStatusAsync();
        return Ok(new[] { status.Controller });
    }

    [HttpGet("cameras")]
    public async Task<IActionResult> GetCameras()
    {
        var channels = await _cameraService.GetChannelsAsync();
        return Ok(channels);
    }

    [HttpGet("grippers")]
    public async Task<IActionResult> GetGrippers()
    {
        var status = await _deviceService.GetStatusAsync();
        return Ok(new
        {
            left = status.LeftGripper,
            right = status.RightGripper
        });
    }

    [HttpPut("cameras/settings")]
    public async Task<IActionResult> UpdateCameraSettings([FromBody] UpdateCameraSettingsRequest request)
    {
        await _cameraService.UpdateSettingsAsync(request.Channel, request.Width, request.Height, request.Fps);
        return Ok(new { message = "카메라 설정을 업데이트했습니다." });
    }

    [HttpPut("robots/hand-guide")]
    public async Task<IActionResult> SetHandGuideMode([FromBody] SetHandGuideModeDto request)
    {
        await _deviceService.SetHandGuideModeAsync(request.Arm, request.Enabled);
        return Ok(new { message = "핸드 가이드 모드를 변경했습니다." });
    }

    public record UpdateCameraSettingsRequest(string Channel, int Width, int Height, int Fps);
}
