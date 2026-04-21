using RobotLearningTool.Application.Interfaces;
using RobotLearningTool.Domain.Models;

namespace RobotLearningTool.Infrastructure.Mock;

public class MockMotionRecordService : IMotionRecordService
{
    private readonly List<MotionRecord> _records =
    [
        new() { Id = "mr-001", TaskId = "task-002", Type = "demo", Target = "both", StartedAt = DateTime.UtcNow.AddDays(-1).AddHours(-3), EndedAt = DateTime.UtcNow.AddDays(-1).AddHours(-2).AddMinutes(-50), Frames = GenerateMockFrames(30) },
        new() { Id = "mr-002", TaskId = "task-002", Type = "manual_test", Target = "left", StartedAt = DateTime.UtcNow.AddDays(-1), EndedAt = DateTime.UtcNow.AddDays(-1).AddMinutes(5), Frames = GenerateMockFrames(15) },
    ];

    private MotionRecord? _activeRecording;

    private static List<PlaybackFrame> GenerateMockFrames(int count)
    {
        var frames = new List<PlaybackFrame>();
        for (var i = 0; i < count; i++)
        {
            var t = i / (float)count;
            var angle = t * MathF.PI * 2;
            frames.Add(new PlaybackFrame
            {
                TimeOffset = t * 5f,
                LeftTcp = new TcpPose { X = 0.3f + MathF.Sin(angle) * 0.05f, Y = 0.15f, Z = 0.5f + MathF.Cos(angle) * 0.03f, Pitch = -1.57f },
                RightTcp = new TcpPose { X = 0.3f + MathF.Cos(angle) * 0.05f, Y = -0.15f, Z = 0.5f + MathF.Sin(angle) * 0.03f, Pitch = -1.57f },
                LeftJoints = [MathF.Sin(angle) * 0.3f, -0.5f, 1.0f, 0f, 0.5f, 0f],
                RightJoints = [MathF.Cos(angle) * 0.3f, -0.5f, 1.0f, 0f, 0.5f, 0f],
            });
        }

        return frames;
    }

    public Task<MotionRecord> StartRecordingAsync(string taskId, string type, string target)
    {
        _activeRecording = new MotionRecord
        {
            Id = $"mr-{Guid.NewGuid().ToString("N")[..8]}",
            TaskId = taskId,
            Type = type,
            Target = target,
            StartedAt = DateTime.UtcNow,
            Frames = []
        };

        _records.Add(_activeRecording);
        return Task.FromResult(_activeRecording);
    }

    public Task<MotionRecord> StopRecordingAsync(string id)
    {
        var record = _records.First(item => item.Id == id);
        record.EndedAt = DateTime.UtcNow;
        record.Frames = GenerateMockFrames(30);
        _activeRecording = null;
        return Task.FromResult(record);
    }

    public Task<List<MotionRecord>> GetAllAsync(string? taskId = null) =>
        Task.FromResult(taskId == null ? _records.ToList() : _records.Where(item => item.TaskId == taskId).ToList());

    public Task<MotionRecord?> GetByIdAsync(string id) =>
        Task.FromResult(_records.FirstOrDefault(item => item.Id == id));

    public Task DeleteAsync(string id)
    {
        _records.RemoveAll(item => item.Id == id);
        return Task.CompletedTask;
    }

    public Task<List<PlaybackFrame>> GetPlaybackAsync(string id)
    {
        var record = _records.FirstOrDefault(item => item.Id == id);
        return Task.FromResult(record?.Frames ?? []);
    }
}
