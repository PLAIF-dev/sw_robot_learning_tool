namespace RobotLearningTool.Domain.Models;

public class PlaybackFrame
{
    public float TimeOffset { get; set; }
    public TcpPose LeftTcp { get; set; } = new();
    public TcpPose RightTcp { get; set; } = new();
    public float[] LeftJoints { get; set; } = new float[6];
    public float[] RightJoints { get; set; } = new float[6];
}
