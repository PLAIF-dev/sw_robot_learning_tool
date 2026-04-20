using RobotLearningTool.Application.Interfaces;
using RobotLearningTool.Domain.Models;

namespace RobotLearningTool.Infrastructure.Mock;

public class MockCheckpointService : ICheckpointService
{
    private readonly List<Checkpoint> _checkpoints = new()
    {
        new Checkpoint { Id = "ckpt-001", SessionId = "sess-002", Name = "Checkpoint-01", SuccessRate = 0.65f, AverageDuration = 5.2f, TotalEpisodes = 40, CreatedAt = DateTime.UtcNow.AddDays(-2).AddHours(2), IsBaseForAdditional = true },
        new Checkpoint { Id = "ckpt-002", SessionId = "sess-002", Name = "Checkpoint-02", SuccessRate = 0.78f, AverageDuration = 4.8f, TotalEpisodes = 80, CreatedAt = DateTime.UtcNow.AddDays(-1).AddHours(4), IsBaseForAdditional = false },
    };

    public Task<List<Checkpoint>> GetAllAsync() => Task.FromResult(_checkpoints.ToList());

    public Task<Checkpoint> CreateAsync(string sessionId, string name)
    {
        var cp = new Checkpoint
        {
            Id = $"ckpt-{Guid.NewGuid().ToString("N")[..8]}",
            SessionId = sessionId,
            Name = name,
            SuccessRate = 0f,
            AverageDuration = 0f,
            TotalEpisodes = 0,
            CreatedAt = DateTime.UtcNow,
            IsBaseForAdditional = false
        };
        _checkpoints.Add(cp);
        return Task.FromResult(cp);
    }

    public Task<Checkpoint?> GetByIdAsync(string id) =>
        Task.FromResult(_checkpoints.FirstOrDefault(c => c.Id == id));

    public Task DeleteAsync(string id)
    {
        _checkpoints.RemoveAll(c => c.Id == id);
        return Task.CompletedTask;
    }
}
