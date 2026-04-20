using RobotLearningTool.Application.Interfaces;
using RobotLearningTool.Domain.Models;

namespace RobotLearningTool.Infrastructure.Mock;

public class MockSessionService : ISessionService
{
    private readonly List<Session> _sessions =
    [
        new()
        {
            Id = "sess-001",
            Name = "Cup Pick Task v1",
            Mode = SessionMode.NewTraining,
            Description = "컵 집기 작업 초기 학습 세션",
            CurrentStage = TrainingStage.Environment,
            IsActive = false,
            CreatedAt = DateTime.UtcNow.AddDays(-5),
            UpdatedAt = DateTime.UtcNow.AddDays(-4)
        },
        new()
        {
            Id = "sess-002",
            Name = "Sorting Task Demo",
            Mode = SessionMode.NewTraining,
            Description = "분류 시연용 메인 세션",
            CurrentStage = TrainingStage.Evaluation,
            IsActive = true,
            CreatedAt = DateTime.UtcNow.AddDays(-2),
            UpdatedAt = DateTime.UtcNow.AddHours(-12)
        },
        new()
        {
            Id = "sess-003",
            Name = "Cup Pick Continued",
            Mode = SessionMode.AdditionalTraining,
            Description = "체크포인트 기반 추가 학습 세션",
            CurrentStage = TrainingStage.MainTraining,
            IsActive = false,
            BaseCheckpointId = "ckpt-001",
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = DateTime.UtcNow.AddHours(-3)
        }
    ];

    public Task<List<Session>> GetAllAsync() => Task.FromResult(_sessions.ToList());

    public Task<Session?> GetByIdAsync(string id) =>
        Task.FromResult(_sessions.FirstOrDefault(session => session.Id == id));

    public Task<Session> CreateAsync(string name, SessionMode mode, string description, string? baseCheckpointId)
    {
        var session = new Session
        {
            Id = $"sess-{Guid.NewGuid().ToString("N")[..8]}",
            Name = name,
            Mode = mode,
            Description = description,
            BaseCheckpointId = baseCheckpointId,
            CurrentStage = TrainingStage.Environment,
            IsActive = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _sessions.Add(session);
        return Task.FromResult(session);
    }

    public Task<Session> UpdateAsync(string id, string name, string description)
    {
        var session = _sessions.FirstOrDefault(item => item.Id == id)
            ?? throw new InvalidOperationException("Session not found.");

        session.Name = name;
        session.Description = description;
        session.UpdatedAt = DateTime.UtcNow;

        return Task.FromResult(session);
    }

    public Task<Session> DuplicateAsync(string id)
    {
        var source = _sessions.FirstOrDefault(item => item.Id == id)
            ?? throw new InvalidOperationException("Session not found.");

        var duplicate = new Session
        {
            Id = $"sess-{Guid.NewGuid().ToString("N")[..8]}",
            Name = $"{source.Name} (복제)",
            Mode = source.Mode,
            Description = source.Description,
            BaseCheckpointId = source.BaseCheckpointId,
            CurrentStage = TrainingStage.Environment,
            IsActive = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _sessions.Add(duplicate);
        return Task.FromResult(duplicate);
    }

    public Task SetActiveAsync(string id)
    {
        var session = _sessions.FirstOrDefault(item => item.Id == id)
            ?? throw new InvalidOperationException("Session not found.");

        foreach (var item in _sessions)
        {
            item.IsActive = false;
        }

        session.IsActive = true;
        session.UpdatedAt = DateTime.UtcNow;
        return Task.CompletedTask;
    }
}
