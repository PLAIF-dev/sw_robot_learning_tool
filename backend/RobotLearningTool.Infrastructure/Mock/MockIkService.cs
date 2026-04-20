using RobotLearningTool.Application.Interfaces;
using RobotLearningTool.Domain.Models;

namespace RobotLearningTool.Infrastructure.Mock;

public class MockIkService : IIkService
{
    private TcpPose _leftTcp = new() { X = 0.3f, Y = 0.15f, Z = 0.5f, Roll = 0f, Pitch = -1.57f, Yaw = 0f };
    private TcpPose _rightTcp = new() { X = 0.3f, Y = -0.15f, Z = 0.5f, Roll = 0f, Pitch = -1.57f, Yaw = 0f };
    private string _selectedTarget = "left";

    public Task<IKResult> SolveAsync(string target, string coordinateFrame, float dx, float dy, float dz, float droll, float dpitch, float dyaw)
    {
        bool ikFail = Math.Abs(dx) > 0.5f || Math.Abs(dy) > 0.5f || Math.Abs(dz) > 0.5f;
        if (ikFail)
            return Task.FromResult(new IKResult { Success = false, IkSuccess = false, ErrorReason = "IK_FAILED: 목표 위치가 작업 공간을 벗어났습니다." });

        void ApplyDelta(TcpPose p) { p.X += dx; p.Y += dy; p.Z += dz; p.Roll += droll; p.Pitch += dpitch; p.Yaw += dyaw; }

        TcpPose resultPose;
        if (target == "left" || target == "both") { ApplyDelta(_leftTcp); resultPose = _leftTcp; }
        else { ApplyDelta(_rightTcp); resultPose = _rightTcp; }
        if (target == "both") ApplyDelta(_rightTcp);

        float[] joints = ComputeMockJoints(resultPose);
        return Task.FromResult(new IKResult
        {
            Success = true,
            IkSuccess = true,
            TargetTcpPose = resultPose,
            SolvedJoints = joints
        });
    }

    private static float[] ComputeMockJoints(TcpPose p) => new[]
    {
        MathF.Atan2(p.Y, p.X),
        p.Z * 0.5f,
        p.X * 0.3f,
        p.Yaw,
        p.Pitch + 1.57f,
        p.Roll
    };

    public Task<TcpPose> GetTcpStateAsync(string arm) =>
        Task.FromResult(arm == "right" ? _rightTcp : _leftTcp);

    public Task<JointState> GetJointStateAsync(string arm) =>
        Task.FromResult(new JointState { Target = arm, Joints = ComputeMockJoints(arm == "right" ? _rightTcp : _leftTcp) });

    public Task SelectTargetAsync(string target) { _selectedTarget = target; return Task.CompletedTask; }

    public Task ResetAsync(string target)
    {
        if (target == "left" || target == "both") _leftTcp = new() { X = 0.3f, Y = 0.15f, Z = 0.5f, Pitch = -1.57f };
        if (target == "right" || target == "both") _rightTcp = new() { X = 0.3f, Y = -0.15f, Z = 0.5f, Pitch = -1.57f };
        return Task.CompletedTask;
    }
}
