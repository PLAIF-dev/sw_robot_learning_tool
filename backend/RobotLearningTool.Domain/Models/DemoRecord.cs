namespace RobotLearningTool.Domain.Models;

public class DemoRecord
{
    public string Id { get; set; } = string.Empty;
    public string TaskId { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public bool? MarkedSuccess { get; set; }
    public string MotionRecordId { get; set; } = string.Empty;
}
