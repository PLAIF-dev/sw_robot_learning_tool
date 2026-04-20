using Microsoft.AspNetCore.Mvc;
using RobotLearningTool.Application.Dtos;
using RobotLearningTool.Application.Interfaces;
using RobotLearningTool.Domain.Models;

namespace RobotLearningTool.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly ISessionService _sessionService;
    private readonly IDeviceService _deviceService;
    private readonly ICheckpointService _checkpointService;
    private readonly ITrainingService _trainingService;

    public DashboardController(
        ISessionService sessionService,
        IDeviceService deviceService,
        ICheckpointService checkpointService,
        ITrainingService trainingService)
    {
        _sessionService = sessionService;
        _deviceService = deviceService;
        _checkpointService = checkpointService;
        _trainingService = trainingService;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var sessions = await _sessionService.GetAllAsync();
        var activeSession = sessions.FirstOrDefault(item => item.IsActive);
        var recentSessions = sessions
            .OrderByDescending(item => item.UpdatedAt)
            .Take(3)
            .Select(ToSessionSummary)
            .ToList();

        var deviceStatus = await _deviceService.GetStatusAsync();
        var checkpoints = await _checkpointService.GetAllAsync();
        var latestCheckpoint = checkpoints.OrderByDescending(item => item.CreatedAt).FirstOrDefault();
        var demoStatus = await _trainingService.GetDemoStatusAsync();
        var mainStatus = await _trainingService.GetMainStatusAsync();

        return Ok(new
        {
            activeSession = activeSession is null ? null : ToSessionSummary(activeSession),
            recentSessions,
            deviceSummary = new
            {
                LeftArmConnected = deviceStatus.LeftArm.Connected,
                RightArmConnected = deviceStatus.RightArm.Connected,
                ControllerConnected = deviceStatus.Controller.Connected,
                CameraConnectedCount = new[] { deviceStatus.LeftCamera, deviceStatus.RightCamera, deviceStatus.HeadCamera }.Count(item => item.Connected)
            },
            latestCheckpoint = latestCheckpoint is null
                ? null
                : new CheckpointDto(
                    latestCheckpoint.Id,
                    latestCheckpoint.SessionId,
                    latestCheckpoint.Name,
                    latestCheckpoint.SuccessRate,
                    latestCheckpoint.AverageDuration,
                    latestCheckpoint.TotalEpisodes,
                    latestCheckpoint.CreatedAt,
                    latestCheckpoint.IsBaseForAdditional),
            recentDemoCount = demoStatus.DemoCount,
            recentEpisodeCount = mainStatus.TotalEpisodes,
            overallSuccessRate = mainStatus.SuccessRate
        });
    }

    private static SessionSummaryDto ToSessionSummary(Session session) =>
        new(session.Id, session.Name, session.Mode.ToString(), session.CurrentStage.ToString(), session.IsActive, session.CreatedAt);
}
