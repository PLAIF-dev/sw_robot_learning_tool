namespace RobotLearningTool.Domain.Models;

public class TaskItem
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public TaskMode Mode { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public TrainingStage CurrentStage { get; set; }
    public bool IsActive { get; set; }
    public string? BaseCheckpointId { get; set; }
}

public enum TaskMode
{
    NewTraining,
    AdditionalTraining
}

public enum TrainingStage
{
    Environment,
    Roi,
    Classifier,
    Demo,
    MainTraining,
    Evaluation
}
