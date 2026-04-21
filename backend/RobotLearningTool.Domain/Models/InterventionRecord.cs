namespace RobotLearningTool.Domain.Models;

public class InterventionRecord
{
    public string Id { get; set; } = string.Empty;
    public string TaskId { get; set; } = string.Empty;
    public string EpisodeId { get; set; } = string.Empty;
    public DateTime OccurredAt { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string MotionRecordId { get; set; } = string.Empty;
}
