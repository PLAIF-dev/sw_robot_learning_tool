using Microsoft.AspNetCore.Mvc;
using RobotLearningTool.Application.Dtos;
using RobotLearningTool.Application.Interfaces;
using RobotLearningTool.Domain.Models;

namespace RobotLearningTool.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly ITaskService _taskService;
    private readonly IDeviceService _deviceService;
    private readonly ICheckpointService _checkpointService;
    private readonly ITrainingService _trainingService;

    public DashboardController(
        ITaskService taskService,
        IDeviceService deviceService,
        ICheckpointService checkpointService,
        ITrainingService trainingService)
    {
        _taskService = taskService;
        _deviceService = deviceService;
        _checkpointService = checkpointService;
        _trainingService = trainingService;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var tasks = await _taskService.GetAllAsync();
        var activeTask = tasks.FirstOrDefault(item => item.IsActive);
        var recentTasks = tasks
            .OrderByDescending(item => item.UpdatedAt)
            .Take(3)
            .Select(ToTaskSummary)
            .ToList();

        var deviceStatus = await _deviceService.GetStatusAsync();
        var checkpoints = await _checkpointService.GetAllAsync();
        var latestCheckpoint = checkpoints.OrderByDescending(item => item.CreatedAt).FirstOrDefault();
        var demoStatus = await _trainingService.GetDemoStatusAsync();
        var mainStatus = await _trainingService.GetMainStatusAsync();

        return Ok(new
        {
            activeTask = activeTask is null ? null : ToTaskSummary(activeTask),
            recentTasks,
            deviceSummary = new
            {
                leftArmConnected = deviceStatus.LeftArm.Connected,
                rightArmConnected = deviceStatus.RightArm.Connected,
                controllerConnected = deviceStatus.Controller.Connected,
                cameraConnectedCount = new[] { deviceStatus.LeftCamera, deviceStatus.RightCamera, deviceStatus.HeadCamera }.Count(item => item.Connected)
            },
            latestCheckpoint = latestCheckpoint is null
                ? null
                : new CheckpointDto(
                    latestCheckpoint.Id,
                    latestCheckpoint.TaskId,
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

    private static TaskSummaryDto ToTaskSummary(TaskItem taskItem) =>
        new(taskItem.Id, taskItem.Name, taskItem.Mode.ToString(), taskItem.CurrentStage.ToString(), taskItem.IsActive, taskItem.CreatedAt);
}
