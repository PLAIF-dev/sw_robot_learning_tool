namespace RobotLearningTool.Application.Dtos;

public record TcpPoseDto(float X, float Y, float Z, float Roll, float Pitch, float Yaw);
public record JointStateDto(string Target, float[] Joints);
public record IkSolveRequestDto(string Target, string CoordinateFrame, float DeltaX, float DeltaY, float DeltaZ, float DeltaRoll, float DeltaPitch, float DeltaYaw);
public record IkSolveResponseDto(bool Success, TcpPoseDto? TargetTcpPose, float[]? SolvedJointState, bool IkSuccess, string? ErrorReason);
