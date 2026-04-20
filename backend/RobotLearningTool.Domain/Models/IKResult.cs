namespace RobotLearningTool.Domain.Models;

public class IKResult
{
    public bool Success { get; set; }
    public TcpPose? TargetTcpPose { get; set; }
    public float[]? SolvedJoints { get; set; }
    public bool IkSuccess { get; set; }
    public string? ErrorReason { get; set; }
}
