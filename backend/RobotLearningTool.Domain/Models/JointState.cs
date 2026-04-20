namespace RobotLearningTool.Domain.Models;

public class JointState
{
    public string Target { get; set; } = string.Empty;
    public float[] Joints { get; set; } = new float[6];
}
