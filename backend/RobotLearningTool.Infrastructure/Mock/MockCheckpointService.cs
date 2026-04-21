using RobotLearningTool.Application.Interfaces;
using RobotLearningTool.Domain.Models;

namespace RobotLearningTool.Infrastructure.Mock;

public class MockCheckpointService : ICheckpointService
{
    private readonly List<Checkpoint> _checkpoints =
    [
        new() { Id = "ckpt-001", TaskId = "task-002", Name = "Checkpoint-01", SuccessRate = 0.65f, AverageDuration = 5.2f, TotalEpisodes = 40, CreatedAt = DateTime.UtcNow.AddDays(-2).AddHours(2), IsBaseForAdditional = true },
        new() { Id = "ckpt-002", TaskId = "task-002", Name = "Checkpoint-02", SuccessRate = 0.78f, AverageDuration = 4.8f, TotalEpisodes = 80, CreatedAt = DateTime.UtcNow.AddDays(-1).AddHours(4), IsBaseForAdditional = false },
    ];

    public Task<List<Checkpoint>> GetAllAsync() => Task.FromResult(_checkpoints.ToList());

    public Task<Checkpoint> CreateAsync(string taskId, string name)
    {
        var checkpoint = new Checkpoint
        {
            Id = $"ckpt-{Guid.NewGuid().ToString("N")[..8]}",
            TaskId = taskId,
            Name = name,
            SuccessRate = 0f,
            AverageDuration = 0f,
            TotalEpisodes = 0,
            CreatedAt = DateTime.UtcNow,
            IsBaseForAdditional = false
        };

        _checkpoints.Add(checkpoint);
        return Task.FromResult(checkpoint);
    }

    public Task<Checkpoint?> GetByIdAsync(string id) =>
        Task.FromResult(_checkpoints.FirstOrDefault(item => item.Id == id));

    public Task DeleteAsync(string id)
    {
        _checkpoints.RemoveAll(item => item.Id == id);
        return Task.CompletedTask;
    }
}
