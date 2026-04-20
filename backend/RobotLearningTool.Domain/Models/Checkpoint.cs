namespace RobotLearningTool.Domain.Models;

public class Checkpoint
{
    public string Id { get; set; } = string.Empty;
    public string SessionId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public float SuccessRate { get; set; }
    public float AverageDuration { get; set; }
    public int TotalEpisodes { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsBaseForAdditional { get; set; }
}
