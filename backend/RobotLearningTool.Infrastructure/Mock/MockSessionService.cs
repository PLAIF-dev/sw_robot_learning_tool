using RobotLearningTool.Application.Interfaces;
using RobotLearningTool.Domain.Models;

namespace RobotLearningTool.Infrastructure.Mock;

public class MockTaskService : ITaskService
{
    private readonly List<TaskItem> _tasks =
    [
        new()
        {
            Id = "task-001",
            Name = "Cup Pick Task v1",
            Mode = TaskMode.NewTraining,
            Description = "컵 집기 작업 초기 학습 작업",
            CurrentStage = TrainingStage.Environment,
            IsActive = false,
            CreatedAt = DateTime.UtcNow.AddDays(-5),
            UpdatedAt = DateTime.UtcNow.AddDays(-4)
        },
        new()
        {
            Id = "task-002",
            Name = "Sorting Task Demo",
            Mode = TaskMode.NewTraining,
            Description = "분류 시연용 메인 작업",
            CurrentStage = TrainingStage.Evaluation,
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddDays(-2),
            UpdatedAt = DateTime.UtcNow.AddHours(-12)
        },
        new()
        {
            Id = "task-003",
            Name = "Cup Pick Continued",
            Mode = TaskMode.AdditionalTraining,
            Description = "체크포인트 기반 추가 학습 작업",
            CurrentStage = TrainingStage.MainTraining,
            IsActive = false,
            BaseCheckpointId = "ckpt-001",
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = DateTime.UtcNow.AddHours(-3)
        }
    ];

    public Task<List<TaskItem>> GetAllAsync() => Task.FromResult(_tasks.ToList());

    public Task<TaskItem?> GetByIdAsync(string id) =>
        Task.FromResult(_tasks.FirstOrDefault(task => task.Id == id));

    public Task<TaskItem> CreateAsync(string name, TaskMode mode, string description, string? baseCheckpointId)
    {
        var taskItem = new TaskItem
        {
            Id = $"task-{Guid.NewGuid().ToString("N")[..8]}",
            Name = name,
            Mode = mode,
            Description = description,
            BaseCheckpointId = baseCheckpointId,
            CurrentStage = TrainingStage.Environment,
            IsActive = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _tasks.Add(taskItem);
        return Task.FromResult(taskItem);
    }

    public Task<TaskItem> UpdateAsync(string id, string name, string description)
    {
        var taskItem = _tasks.FirstOrDefault(item => item.Id == id)
            ?? throw new InvalidOperationException("Task not found.");

        taskItem.Name = name;
        taskItem.Description = description;
        taskItem.UpdatedAt = DateTime.UtcNow;

        return Task.FromResult(taskItem);
    }

    public Task<TaskItem> DuplicateAsync(string id)
    {
        var source = _tasks.FirstOrDefault(item => item.Id == id)
            ?? throw new InvalidOperationException("Task not found.");

        var duplicate = new TaskItem
        {
            Id = $"task-{Guid.NewGuid().ToString("N")[..8]}",
            Name = $"{source.Name} (복제)",
            Mode = source.Mode,
            Description = source.Description,
            BaseCheckpointId = source.BaseCheckpointId,
            CurrentStage = TrainingStage.Environment,
            IsActive = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _tasks.Add(duplicate);
        return Task.FromResult(duplicate);
    }

    public Task SetActiveAsync(string id)
    {
        var taskItem = _tasks.FirstOrDefault(item => item.Id == id)
            ?? throw new InvalidOperationException("Task not found.");

        foreach (var item in _tasks)
        {
            item.IsActive = false;
        }

        taskItem.IsActive = true;
        taskItem.UpdatedAt = DateTime.UtcNow;
        return Task.CompletedTask;
    }
}
