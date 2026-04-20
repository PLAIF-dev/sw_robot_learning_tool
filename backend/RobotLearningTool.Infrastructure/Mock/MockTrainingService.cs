using RobotLearningTool.Application.Interfaces;
using RobotLearningTool.Application.Models;
using RobotLearningTool.Domain.Models;

namespace RobotLearningTool.Infrastructure.Mock;

public class MockTrainingService : ITrainingService
{
    private TrainingStage _currentStage = TrainingStage.Environment;
    private TrainingEnvironmentConfig _environment = new();
    private ClassifierStatus _classifier = new()
    {
        SuccessCount = 25,
        FailureCount = 22,
        OutOfRangeCount = 3,
        CurrentLabel = "success"
    };

    private readonly List<RoiRectangle> _roiSettings =
    [
        new() { Channel = "left", X = 0.16f, Y = 0.18f, Width = 0.28f, Height = 0.28f },
        new() { Channel = "right", X = 0.54f, Y = 0.20f, Width = 0.24f, Height = 0.26f },
        new() { Channel = "head", X = 0.30f, Y = 0.22f, Width = 0.34f, Height = 0.30f }
    ];

    private bool _isDemoRecording;
    private bool _isMainTrainingRunning;

    private readonly List<DemoRecord> _demos =
    [
        new() { Id = "demo-001", SessionId = "sess-002", StartedAt = DateTime.UtcNow.AddHours(-8), EndedAt = DateTime.UtcNow.AddHours(-8).AddMinutes(2), MarkedSuccess = true, MotionRecordId = "mr-001" },
        new() { Id = "demo-002", SessionId = "sess-002", StartedAt = DateTime.UtcNow.AddHours(-7), EndedAt = DateTime.UtcNow.AddHours(-7).AddMinutes(3), MarkedSuccess = true, MotionRecordId = "mr-001" },
        new() { Id = "demo-003", SessionId = "sess-002", StartedAt = DateTime.UtcNow.AddHours(-6), EndedAt = DateTime.UtcNow.AddHours(-6).AddMinutes(2), MarkedSuccess = false, MotionRecordId = "mr-002" },
        new() { Id = "demo-004", SessionId = "sess-002", StartedAt = DateTime.UtcNow.AddHours(-5), EndedAt = DateTime.UtcNow.AddHours(-5).AddMinutes(3), MarkedSuccess = true, MotionRecordId = "mr-002" }
    ];

    private readonly List<EpisodeRecord> _episodes;

    private readonly List<InterventionRecord> _interventions =
    [
        new()
        {
            Id = "intv-001",
            SessionId = "sess-002",
            EpisodeId = "ep-003",
            OccurredAt = DateTime.UtcNow.AddHours(-4),
            Reason = "그리퍼 미세 조정",
            MotionRecordId = "mr-002"
        }
    ];

    public MockTrainingService()
    {
        var random = new Random(42);
        _episodes = Enumerable.Range(1, 10)
            .Select(index => new EpisodeRecord
            {
                Id = $"ep-{index:D3}",
                SessionId = "sess-002",
                EpisodeNumber = index,
                Success = index % 4 != 0,
                DurationSeconds = 4f + (float)random.NextDouble() * 3.5f,
                StartedAt = DateTime.UtcNow.AddHours(-10 + index),
                Notes = index % 3 == 0 ? "수동 개입 1회" : null
            })
            .ToList();
    }

    public Task<TrainingStage> GetCurrentStageAsync() => Task.FromResult(_currentStage);

    public Task SetCurrentStageAsync(TrainingStage stage)
    {
        _currentStage = stage;
        return Task.CompletedTask;
    }

    public Task<TrainingEnvironmentConfig> GetEnvironmentAsync() => Task.FromResult(_environment);

    public Task SaveEnvironmentAsync(TrainingEnvironmentConfig config)
    {
        _environment = config;
        return Task.CompletedTask;
    }

    public Task<List<RoiRectangle>> GetRoiSettingsAsync() =>
        Task.FromResult(_roiSettings
            .Select(CloneRoi)
            .ToList());

    public Task<RoiRectangle> SaveRoiSettingAsync(string channel, RoiRectangle roi)
    {
        var normalizedChannel = channel.Trim().ToLowerInvariant();
        var existing = _roiSettings.FirstOrDefault(item => item.Channel.Equals(normalizedChannel, StringComparison.OrdinalIgnoreCase));

        var clamped = new RoiRectangle
        {
            Channel = normalizedChannel,
            X = Clamp01(roi.X),
            Y = Clamp01(roi.Y),
            Width = Math.Clamp(roi.Width, 0.05f, 0.9f),
            Height = Math.Clamp(roi.Height, 0.05f, 0.9f)
        };

        clamped.X = Math.Clamp(clamped.X, 0f, 1f - clamped.Width);
        clamped.Y = Math.Clamp(clamped.Y, 0f, 1f - clamped.Height);

        if (existing is null)
        {
            _roiSettings.Add(clamped);
        }
        else
        {
            existing.X = clamped.X;
            existing.Y = clamped.Y;
            existing.Width = clamped.Width;
            existing.Height = clamped.Height;
        }

        return Task.FromResult(CloneRoi(existing ?? clamped));
    }

    public Task<ClassifierStatus> GetClassifierStatusAsync() => Task.FromResult(_classifier);

    public Task CollectClassifierSampleAsync(string label)
    {
        switch (label.ToLowerInvariant())
        {
            case "success":
                _classifier.SuccessCount++;
                break;
            case "failure":
                _classifier.FailureCount++;
                break;
            default:
                _classifier.OutOfRangeCount++;
                label = "out_of_range";
                break;
        }

        _classifier.CurrentLabel = label;
        return Task.CompletedTask;
    }

    public Task ResetClassifierAsync()
    {
        _classifier = new ClassifierStatus();
        return Task.CompletedTask;
    }

    public Task<DemoStatus> GetDemoStatusAsync()
    {
        return Task.FromResult(new DemoStatus
        {
            DemoCount = _demos.Count,
            IsRecording = _isDemoRecording,
            Demos = _demos.ToList()
        });
    }

    public Task StartDemoAsync()
    {
        _isDemoRecording = true;
        return Task.CompletedTask;
    }

    public Task MarkDemoSuccessAsync()
    {
        var activeDemo = _demos.LastOrDefault();
        if (activeDemo is not null)
        {
            activeDemo.MarkedSuccess = true;
        }

        return Task.CompletedTask;
    }

    public Task EndDemoAsync()
    {
        _isDemoRecording = false;
        _demos.Add(new DemoRecord
        {
            Id = $"demo-{Guid.NewGuid().ToString("N")[..8]}",
            SessionId = "sess-002",
            StartedAt = DateTime.UtcNow.AddMinutes(-2),
            EndedAt = DateTime.UtcNow,
            MarkedSuccess = null,
            MotionRecordId = "mr-001"
        });

        return Task.CompletedTask;
    }

    public Task DeleteDemoAsync(string id)
    {
        _demos.RemoveAll(item => item.Id == id);
        return Task.CompletedTask;
    }

    public Task<MainTrainingStatus> GetMainStatusAsync()
    {
        var successCount = _episodes.Count(item => item.Success == true);
        var averageDuration = _episodes.Any(item => item.DurationSeconds.HasValue)
            ? _episodes.Where(item => item.DurationSeconds.HasValue).Average(item => item.DurationSeconds!.Value)
            : 0;

        return Task.FromResult(new MainTrainingStatus
        {
            IsRunning = _isMainTrainingRunning,
            TotalEpisodes = _episodes.Count,
            SuccessCount = successCount,
            AverageDuration = averageDuration,
            RecentEpisodes = _episodes.OrderByDescending(item => item.StartedAt).Take(6).ToList()
        });
    }

    public Task StartMainTrainingAsync()
    {
        _isMainTrainingRunning = true;
        return Task.CompletedTask;
    }

    public Task StopMainTrainingAsync()
    {
        _isMainTrainingRunning = false;
        return Task.CompletedTask;
    }

    public Task MarkEpisodeResultAsync(bool success)
    {
        _episodes.Add(new EpisodeRecord
        {
            Id = $"ep-{Guid.NewGuid().ToString("N")[..8]}",
            SessionId = "sess-002",
            EpisodeNumber = _episodes.Count + 1,
            Success = success,
            DurationSeconds = 3.5f + Random.Shared.NextSingle() * 4f,
            StartedAt = DateTime.UtcNow.AddSeconds(-10),
            Notes = success ? "자동 성공 판정" : "수동 실패 판정"
        });

        return Task.CompletedTask;
    }

    public Task DeleteEpisodeAsync(string id)
    {
        _episodes.RemoveAll(item => item.Id == id);
        return Task.CompletedTask;
    }

    public Task<EvaluationSummary> GetEvaluationAsync()
    {
        var successCount = _episodes.Count(item => item.Success == true);
        var successRate = _episodes.Count == 0 ? 0 : (float)successCount / _episodes.Count;
        var trainingCompleted = _episodes.Count >= 10 && successRate >= 0.6f;
        var roiConfigured = _roiSettings.Count == 3;

        return Task.FromResult(new EvaluationSummary
        {
            EnvironmentConfigured = true,
            RoiConfigured = roiConfigured,
            ClassifierTrained = _classifier.CanProceed,
            DemoCollected = _demos.Count >= 3,
            TrainingCompleted = trainingCompleted,
            TotalEpisodes = _episodes.Count,
            SuccessRate = successRate,
            NextRecommendedAction = trainingCompleted
                ? "체크포인트를 저장하고 추가 학습 후보를 검토하세요."
                : "ROI와 데모, 에피소드 조건을 채운 뒤 본 학습을 이어가세요.",
            Checkpoints = ["ckpt-001", "ckpt-002"]
        });
    }

    public Task<List<DemoRecord>> GetDemosAsync() => Task.FromResult(_demos.ToList());

    public Task<DemoRecord?> GetDemoByIdAsync(string id) =>
        Task.FromResult(_demos.FirstOrDefault(item => item.Id == id));

    public Task<List<EpisodeRecord>> GetEpisodesAsync() => Task.FromResult(_episodes.ToList());

    public Task<EpisodeRecord?> GetEpisodeByIdAsync(string id) =>
        Task.FromResult(_episodes.FirstOrDefault(item => item.Id == id));

    public Task UpdateEpisodeAsync(string id, bool? success, string? notes)
    {
        var episode = _episodes.FirstOrDefault(item => item.Id == id)
            ?? throw new InvalidOperationException("Episode not found.");

        episode.Success = success ?? episode.Success;
        episode.Notes = notes ?? episode.Notes;
        return Task.CompletedTask;
    }

    public Task<List<InterventionRecord>> GetInterventionsAsync() => Task.FromResult(_interventions.ToList());

    public Task<InterventionRecord?> GetInterventionByIdAsync(string id) =>
        Task.FromResult(_interventions.FirstOrDefault(item => item.Id == id));

    private static RoiRectangle CloneRoi(RoiRectangle roi) =>
        new()
        {
            Channel = roi.Channel,
            X = roi.X,
            Y = roi.Y,
            Width = roi.Width,
            Height = roi.Height
        };

    private static float Clamp01(float value) => Math.Clamp(value, 0f, 1f);
}
