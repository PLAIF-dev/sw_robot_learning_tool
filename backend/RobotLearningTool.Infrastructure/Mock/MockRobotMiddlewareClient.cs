using RobotLearningTool.Application.Interfaces;
using RobotLearningTool.Domain.Models;

namespace RobotLearningTool.Infrastructure.Mock;

public class MockRobotMiddlewareClient : IRobotMiddlewareClient
{
    private const int JointCount = 6;
    private static readonly TcpPose LeftWorldOffset = new() { X = 0.1601f, Y = -0.1725f, Z = 0.5825f };
    private static readonly TcpPose RightWorldOffset = new() { X = -0.1601f, Y = -0.1725f, Z = 0.5825f };

    private static readonly object Sync = new();
    private static TcpPose _leftTcp = new() { X = 0.3f, Y = 0.15f, Z = 0.5f, Roll = 0f, Pitch = -1.57f, Yaw = 0f };
    private static TcpPose _rightTcp = new() { X = 0.3f, Y = -0.15f, Z = 0.5f, Roll = 0f, Pitch = -1.57f, Yaw = 0f };
    private static float[] _leftJointOffsets = new float[JointCount];
    private static float[] _rightJointOffsets = new float[JointCount];
    private static string _selectedTarget = "left";

    public Task<IKResult> SolveAsync(string target, string coordinateFrame, float dx, float dy, float dz, float droll, float dpitch, float dyaw)
    {
        lock (Sync)
        {
            bool ikFail = Math.Abs(dx) > 0.5f || Math.Abs(dy) > 0.5f || Math.Abs(dz) > 0.5f;
            if (ikFail)
            {
                return Task.FromResult(new IKResult
                {
                    Success = false,
                    IkSuccess = false,
                    ErrorReason = "IK_FAILED: mock workspace limit exceeded."
                });
            }

            void ApplyDelta(TcpPose pose)
            {
                pose.X += dx;
                pose.Y += dy;
                pose.Z += dz;
                pose.Roll += droll;
                pose.Pitch += dpitch;
                pose.Yaw += dyaw;
            }

            if (target == "left" || target == "both")
            {
                ApplyDelta(_leftTcp);
            }

            if (target == "right" || target == "both")
            {
                ApplyDelta(_rightTcp);
            }

            return Task.FromResult(new IKResult
            {
                Success = true,
                IkSuccess = true,
                TargetTcpPose = target == "right" ? ToWorldPose(_rightTcp, "right") : ToWorldPose(_leftTcp, "left"),
                SolvedJoints = target == "right"
                    ? ComposeJoints(_rightTcp, _rightJointOffsets)
                    : ComposeJoints(_leftTcp, _leftJointOffsets)
            });
        }
    }

    public Task<IKResult> JogJointAsync(string target, int jointIndex, float delta)
    {
        lock (Sync)
        {
            if (jointIndex < 0 || jointIndex >= JointCount)
            {
                return Task.FromResult(new IKResult
                {
                    Success = false,
                    IkSuccess = false,
                    ErrorReason = "JOINT_INDEX_OUT_OF_RANGE"
                });
            }

            if (target == "left" || target == "both")
            {
                _leftJointOffsets[jointIndex] += delta;
            }

            if (target == "right" || target == "both")
            {
                _rightJointOffsets[jointIndex] += delta;
            }

            return Task.FromResult(new IKResult
            {
                Success = true,
                IkSuccess = true,
                TargetTcpPose = target == "right" ? ToWorldPose(_rightTcp, "right") : ToWorldPose(_leftTcp, "left"),
                SolvedJoints = target == "right"
                    ? ComposeJoints(_rightTcp, _rightJointOffsets)
                    : ComposeJoints(_leftTcp, _leftJointOffsets)
            });
        }
    }

    public Task<TcpPose> GetTcpStateAsync(string arm)
    {
        lock (Sync)
        {
            return Task.FromResult(arm == "right" ? ToWorldPose(_rightTcp, "right") : ToWorldPose(_leftTcp, "left"));
        }
    }

    public Task<JointState> GetJointStateAsync(string arm)
    {
        lock (Sync)
        {
            return Task.FromResult(new JointState
            {
                Target = arm,
                Joints = arm == "right"
                    ? ComposeJoints(_rightTcp, _rightJointOffsets)
                    : ComposeJoints(_leftTcp, _leftJointOffsets)
            });
        }
    }

    public Task SelectTargetAsync(string target)
    {
        lock (Sync)
        {
            _selectedTarget = target;
        }

        return Task.CompletedTask;
    }

    public Task ResetAsync(string target)
    {
        lock (Sync)
        {
            if (target == "left" || target == "both")
            {
                _leftTcp = new TcpPose { X = 0.3f, Y = 0.15f, Z = 0.5f, Pitch = -1.57f };
                _leftJointOffsets = new float[JointCount];
            }

            if (target == "right" || target == "both")
            {
                _rightTcp = new TcpPose { X = 0.3f, Y = -0.15f, Z = 0.5f, Pitch = -1.57f };
                _rightJointOffsets = new float[JointCount];
            }
        }

        return Task.CompletedTask;
    }

    private static float[] ComposeJoints(TcpPose pose, float[] offsets)
    {
        float[] baseJoints = ComputeMockJoints(pose);
        float[] joints = new float[JointCount];
        for (int i = 0; i < JointCount; i++)
        {
            joints[i] = baseJoints[i] + offsets[i];
        }

        return joints;
    }

    private static TcpPose ClonePose(TcpPose pose) => new()
    {
        X = pose.X,
        Y = pose.Y,
        Z = pose.Z,
        Roll = pose.Roll,
        Pitch = pose.Pitch,
        Yaw = pose.Yaw
    };

    private static TcpPose ToWorldPose(TcpPose localPose, string arm)
    {
        TcpPose offset = arm == "right" ? RightWorldOffset : LeftWorldOffset;
        return new TcpPose
        {
            X = offset.X + localPose.X,
            Y = offset.Y + localPose.Y,
            Z = offset.Z + localPose.Z,
            Roll = localPose.Roll,
            Pitch = localPose.Pitch,
            Yaw = localPose.Yaw
        };
    }

    private static float[] ComputeMockJoints(TcpPose pose) => new[]
    {
        MathF.Atan2(pose.Y, pose.X),
        pose.Z * 0.5f,
        pose.X * 0.3f,
        pose.Yaw,
        pose.Pitch + 1.57f,
        pose.Roll
    };
}
