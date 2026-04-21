using Microsoft.AspNetCore.Mvc;
using RobotLearningTool.Application.Dtos;
using RobotLearningTool.Application.Interfaces;
using RobotLearningTool.Domain.Models;

namespace RobotLearningTool.Api.Controllers;

[ApiController]
[Route("api/tasks")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var tasks = await _taskService.GetAllAsync();
        return Ok(tasks.Select(ToSummaryDto));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var taskItem = await _taskService.GetByIdAsync(id);
        if (taskItem is null)
        {
            return NotFound(TaskNotFound());
        }

        return Ok(ToDetailDto(taskItem));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTaskDto request)
    {
        if (!Enum.TryParse<TaskMode>(request.Mode, true, out var mode))
        {
            return BadRequest(new { error = new { code = "INVALID_MODE", message = "지원하지 않는 작업 모드입니다." } });
        }

        var taskItem = await _taskService.CreateAsync(request.Name, mode, request.Description, request.BaseCheckpointId);
        return CreatedAtAction(nameof(GetById), new { id = taskItem.Id }, ToDetailDto(taskItem));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateTaskDto request)
    {
        try
        {
            var taskItem = await _taskService.UpdateAsync(id, request.Name, request.Description);
            return Ok(ToDetailDto(taskItem));
        }
        catch (InvalidOperationException)
        {
            return NotFound(TaskNotFound());
        }
    }

    [HttpPost("{id}/duplicate")]
    public async Task<IActionResult> Duplicate(string id)
    {
        try
        {
            var taskItem = await _taskService.DuplicateAsync(id);
            return Ok(ToDetailDto(taskItem));
        }
        catch (InvalidOperationException)
        {
            return NotFound(TaskNotFound());
        }
    }

    [HttpGet("{id}/state")]
    public async Task<IActionResult> GetState(string id)
    {
        var taskItem = await _taskService.GetByIdAsync(id);
        if (taskItem is null)
        {
            return NotFound(TaskNotFound());
        }

        return Ok(new
        {
            taskId = taskItem.Id,
            isActive = taskItem.IsActive,
            currentStage = taskItem.CurrentStage.ToString(),
            mode = taskItem.Mode.ToString(),
            updatedAt = taskItem.UpdatedAt
        });
    }

    [HttpPost("{id}/activate")]
    public async Task<IActionResult> Activate(string id)
    {
        try
        {
            await _taskService.SetActiveAsync(id);
            return Ok(new { message = "현재 작업으로 활성화했습니다." });
        }
        catch (InvalidOperationException)
        {
            return NotFound(TaskNotFound());
        }
    }

    private static TaskSummaryDto ToSummaryDto(TaskItem taskItem) =>
        new(taskItem.Id, taskItem.Name, taskItem.Mode.ToString(), taskItem.CurrentStage.ToString(), taskItem.IsActive, taskItem.CreatedAt);

    private static TaskDetailDto ToDetailDto(TaskItem taskItem) =>
        new(taskItem.Id, taskItem.Name, taskItem.Mode.ToString(), taskItem.Description, taskItem.CurrentStage.ToString(), taskItem.IsActive, taskItem.CreatedAt, taskItem.UpdatedAt, taskItem.BaseCheckpointId);

    private static object TaskNotFound() => new
    {
        error = new
        {
            code = "TASK_NOT_FOUND",
            message = "작업을 찾을 수 없습니다."
        }
    };
}
