using Microsoft.AspNetCore.Mvc;
using RobotLearningTool.Application.Dtos;
using RobotLearningTool.Application.Interfaces;

namespace RobotLearningTool.Api.Controllers;

[ApiController]
[Route("api/control")]
public class ControlController : ControllerBase
{
    private readonly IIkService _ikService;
    private readonly IMotionRecordService _motionRecordService;

    public ControlController(IIkService ikService, IMotionRecordService motionRecordService)
    {
        _ikService = ikService;
        _motionRecordService = motionRecordService;
    }

    [HttpGet("tcp-state")]
    public async Task<IActionResult> GetTcpState()
    {
        var leftTcp = await _ikService.GetTcpStateAsync("left");
        var rightTcp = await _ikService.GetTcpStateAsync("right");
        var leftJoints = await _ikService.GetJointStateAsync("left");
        var rightJoints = await _ikService.GetJointStateAsync("right");

        return Ok(new
        {
            leftTcp,
            rightTcp,
            leftJoints = leftJoints.Joints,
            rightJoints = rightJoints.Joints,
            ikSuccess = true
        });
    }

    [HttpPost("tcp-select")]
    public async Task<IActionResult> SelectTarget([FromBody] SelectTargetRequest request)
    {
        await _ikService.SelectTargetAsync(request.Target);
        return Ok(new { message = "제어 대상을 변경했습니다.", target = request.Target });
    }

    [HttpPost("tcp-move")]
    public async Task<IActionResult> Move([FromBody] ControlDeltaRequest request)
    {
        var result = await _ikService.SolveAsync(request.Target, request.CoordinateFrame, request.Dx, request.Dy, request.Dz, 0, 0, 0);
        return Ok(ToResponse(result));
    }

    [HttpPost("tcp-rotate")]
    public async Task<IActionResult> Rotate([FromBody] ControlDeltaRequest request)
    {
        var result = await _ikService.SolveAsync(request.Target, request.CoordinateFrame, 0, 0, 0, request.Dx, request.Dy, request.Dz);
        return Ok(ToResponse(result));
    }

    [HttpPost("tcp-reset")]
    public async Task<IActionResult> Reset([FromBody] SelectTargetRequest request)
    {
        await _ikService.ResetAsync(request.Target);
        return Ok(new { message = "TCP 자세를 초기 상태로 되돌렸습니다." });
    }

    [HttpGet("joint-state")]
    public async Task<IActionResult> GetJointState()
    {
        var left = await _ikService.GetJointStateAsync("left");
        var right = await _ikService.GetJointStateAsync("right");
        return Ok(new { left, right });
    }

    [HttpPost("ik/solve")]
    public async Task<IActionResult> Solve([FromBody] IkSolveRequestDto request)
    {
        var result = await _ikService.SolveAsync(
            request.Target,
            request.CoordinateFrame,
            request.DeltaX,
            request.DeltaY,
            request.DeltaZ,
            request.DeltaRoll,
            request.DeltaPitch,
            request.DeltaYaw);

        return Ok(ToResponse(result));
    }

    private static IkSolveResponseDto ToResponse(Domain.Models.IKResult result)
    {
        TcpPoseDto? pose = result.TargetTcpPose is null
            ? null
            : new TcpPoseDto(
                result.TargetTcpPose.X,
                result.TargetTcpPose.Y,
                result.TargetTcpPose.Z,
                result.TargetTcpPose.Roll,
                result.TargetTcpPose.Pitch,
                result.TargetTcpPose.Yaw);

        return new IkSolveResponseDto(result.Success, pose, result.SolvedJoints, result.IkSuccess, result.ErrorReason);
    }

    public record SelectTargetRequest(string Target);
    public record ControlDeltaRequest(string Target, string CoordinateFrame, float Dx, float Dy, float Dz);
}
