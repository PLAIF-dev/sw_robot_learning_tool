namespace RobotLearningTool.Domain.Models;

public class EpisodeRecord
{
    public string Id { get; set; } = string.Empty;
    public string SessionId { get; set; } = string.Empty;
    public int EpisodeNumber { get; set; }
    public bool? Success { get; set; }
    public float? DurationSeconds { get; set; }
    public DateTime StartedAt { get; set; }
    public string? MotionRecordId { get; set; }
    public string? Notes { get; set; }
}
