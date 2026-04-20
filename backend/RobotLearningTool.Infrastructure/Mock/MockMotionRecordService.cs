using RobotLearningTool.Application.Interfaces;
using RobotLearningTool.Domain.Models;

namespace RobotLearningTool.Infrastructure.Mock;

public class MockMotionRecordService : IMotionRecordService
{
    private readonly List<MotionRecord> _records = new()
    {
        new MotionRecord { Id = "mr-001", SessionId = "sess-002", Type = "demo", Target = "both", StartedAt = DateTime.UtcNow.AddDays(-1).AddHours(-3), EndedAt = DateTime.UtcNow.AddDays(-1).AddHours(-2).AddMinutes(-50), Frames = GenerateMockFrames(30) },
        new MotionRecord { Id = "mr-002", SessionId = "sess-002", Type = "manual_test", Target = "left", StartedAt = DateTime.UtcNow.AddDays(-1), EndedAt = DateTime.UtcNow.AddDays(-1).AddMinutes(5), Frames = GenerateMockFrames(15) },
    };
    private MotionRecord? _activeRecording;

    private static List<PlaybackFrame> GenerateMockFrames(int count)
    {
        var frames = new List<PlaybackFrame>();
        for (int i = 0; i < count; i++)
        {
            float t = i / (float)count;
            float angle = t * MathF.PI * 2;
            frames.Add(new PlaybackFrame
            {
                TimeOffset = t * 5f,
                LeftTcp = new TcpPose { X = 0.3f + MathF.Sin(angle) * 0.05f, Y = 0.15f, Z = 0.5f + MathF.Cos(angle) * 0.03f, Pitch = -1.57f },
                RightTcp = new TcpPose { X = 0.3f + MathF.Cos(angle) * 0.05f, Y = -0.15f, Z = 0.5f + MathF.Sin(angle) * 0.03f, Pitch = -1.57f },
                LeftJoints = new float[] { MathF.Sin(angle) * 0.3f, -0.5f, 1.0f, 0f, 0.5f, 0f },
                RightJoints = new float[] { MathF.Cos(angle) * 0.3f, -0.5f, 1.0f, 0f, 0.5f, 0f },
            });
        }
        return frames;
    }

    public Task<MotionRecord> StartRecordingAsync(string sessionId, string type, string target)
    {
        _activeRecording = new MotionRecord
        {
            Id = $"mr-{Guid.NewGuid().ToString("N")[..8]}",
            SessionId = sessionId,
            Type = type,
            Target = target,
            StartedAt = DateTime.UtcNow,
            Frames = new List<PlaybackFrame>()
        };
        _records.Add(_activeRecording);
        return Task.FromResult(_activeRecording);
    }

    public Task<MotionRecord> StopRecordingAsync(string id)
    {
        var record = _records.First(r => r.Id == id);
        record.EndedAt = DateTime.UtcNow;
        record.Frames = GenerateMockFrames(30);
        _activeRecording = null;
        return Task.FromResult(record);
    }

    public Task<List<MotionRecord>> GetAllAsync(string? sessionId = null) =>
        Task.FromResult(sessionId == null ? _records.ToList() : _records.Where(r => r.SessionId == sessionId).ToList());

    public Task<MotionRecord?> GetByIdAsync(string id) =>
        Task.FromResult(_records.FirstOrDefault(r => r.Id == id));

    public Task DeleteAsync(string id) { _records.RemoveAll(r => r.Id == id); return Task.CompletedTask; }

    public Task<List<PlaybackFrame>> GetPlaybackAsync(string id)
    {
        var record = _records.FirstOrDefault(r => r.Id == id);
        return Task.FromResult(record?.Frames ?? new List<PlaybackFrame>());
    }
}
