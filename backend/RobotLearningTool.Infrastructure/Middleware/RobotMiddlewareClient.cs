using RobotLearningTool.Application.Interfaces;
using RobotLearningTool.Domain.Models;

namespace RobotLearningTool.Infrastructure.Middleware;

public class RobotMiddlewareClient : IRobotMiddlewareClient
{
    public Task<IKResult> SolveAsync(string target, string coordinateFrame, float dx, float dy, float dz, float droll, float dpitch, float dyaw) =>
        throw new NotSupportedException("Robot middleware integration is not configured yet.");

    public Task<IKResult> JogJointAsync(string target, int jointIndex, float delta) =>
        throw new NotSupportedException("Robot middleware integration is not configured yet.");

    public Task<TcpPose> GetTcpStateAsync(string arm) =>
        throw new NotSupportedException("Robot middleware integration is not configured yet.");

    public Task<JointState> GetJointStateAsync(string arm) =>
        throw new NotSupportedException("Robot middleware integration is not configured yet.");

    public Task SelectTargetAsync(string target) =>
        throw new NotSupportedException("Robot middleware integration is not configured yet.");

    public Task ResetAsync(string target) =>
        throw new NotSupportedException("Robot middleware integration is not configured yet.");
}
