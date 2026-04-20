using RobotLearningTool.Domain.Models;

namespace RobotLearningTool.Application.Interfaces;

public interface IIkService
{
    Task<IKResult> SolveAsync(string target, string coordinateFrame, float dx, float dy, float dz, float droll, float dpitch, float dyaw);
    Task<TcpPose> GetTcpStateAsync(string arm);
    Task<JointState> GetJointStateAsync(string arm);
    Task SelectTargetAsync(string target);
    Task ResetAsync(string target);
}
