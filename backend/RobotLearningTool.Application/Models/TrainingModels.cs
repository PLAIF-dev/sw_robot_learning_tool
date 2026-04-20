using RobotLearningTool.Domain.Models;

namespace RobotLearningTool.Application.Models;

public class TrainingEnvironmentConfig
{
    public string RobotModel { get; set; } = "DualArm-Mock-v1";
    public string CameraResolution { get; set; } = "640x480";
    public string GripperType { get; set; } = "Parallel";
    public string ControllerType { get; set; } = "SpaceMouse";
    public float LearningRate { get; set; } = 0.001f;
    public int BatchSize { get; set; } = 32;
    public int MaxEpisodes { get; set; } = 100;
}

public class ClassifierStatus
{
    public int SuccessCount { get; set; }
    public int FailureCount { get; set; }
    public int OutOfRangeCount { get; set; }
    public int MinRequired { get; set; } = 20;
    public bool CanProceed => SuccessCount >= MinRequired && FailureCount >= MinRequired;
    public string CurrentLabel { get; set; } = "success";
}

public class DemoStatus
{
    public int DemoCount { get; set; }
    public int MinRequired { get; set; } = 3;
    public bool IsRecording { get; set; }
    public List<DemoRecord> Demos { get; set; } = new();
}

public class MainTrainingStatus
{
    public bool IsRunning { get; set; }
    public int TotalEpisodes { get; set; }
    public int SuccessCount { get; set; }
    public float SuccessRate => TotalEpisodes > 0 ? (float)SuccessCount / TotalEpisodes : 0;
    public float AverageDuration { get; set; }
    public List<EpisodeRecord> RecentEpisodes { get; set; } = new();
}

public class EvaluationSummary
{
    public bool EnvironmentConfigured { get; set; }
    public bool ClassifierTrained { get; set; }
    public bool DemoCollected { get; set; }
    public bool TrainingCompleted { get; set; }
    public int TotalEpisodes { get; set; }
    public float SuccessRate { get; set; }
    public string NextRecommendedAction { get; set; } = "";
    public List<string> Checkpoints { get; set; } = new();
}
