using RobotLearningTool.Application.Interfaces;
using RobotLearningTool.Domain.Models;

namespace RobotLearningTool.Application.Services;

public class RobotControlService : IRobotControlService
{
    private readonly IRobotMiddlewareClient _middlewareClient;

    public RobotControlService(IRobotMiddlewareClient middlewareClient)
    {
        _middlewareClient = middlewareClient;
    }

    public Task<IKResult> SolveAsync(string target, string coordinateFrame, float dx, float dy, float dz, float droll, float dpitch, float dyaw) =>
        _middlewareClient.SolveAsync(target, coordinateFrame, dx, dy, dz, droll, dpitch, dyaw);

    public Task<IKResult> JogJointAsync(string target, int jointIndex, float delta) =>
        _middlewareClient.JogJointAsync(target, jointIndex, delta);

    public Task<TcpPose> GetTcpStateAsync(string arm) =>
        _middlewareClient.GetTcpStateAsync(arm);

    public Task<JointState> GetJointStateAsync(string arm) =>
        _middlewareClient.GetJointStateAsync(arm);

    public Task SelectTargetAsync(string target) =>
        _middlewareClient.SelectTargetAsync(target);

    public Task ResetAsync(string target) =>
        _middlewareClient.ResetAsync(target);
}
