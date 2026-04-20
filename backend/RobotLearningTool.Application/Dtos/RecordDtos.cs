namespace RobotLearningTool.Application.Dtos;

public record MotionRecordDto(string Id, string SessionId, string Type, string Target, DateTime StartedAt, DateTime? EndedAt, int FrameCount);
public record PlaybackFrameDto(float TimeOffset, TcpPoseDto LeftTcp, TcpPoseDto RightTcp, float[] LeftJoints, float[] RightJoints);
public record DemoRecordDto(string Id, string SessionId, DateTime StartedAt, DateTime? EndedAt, bool? MarkedSuccess);
public record EpisodeRecordDto(string Id, string SessionId, int EpisodeNumber, bool? Success, float? DurationSeconds, DateTime StartedAt, string? Notes);
public record CheckpointDto(string Id, string SessionId, string Name, float SuccessRate, float AverageDuration, int TotalEpisodes, DateTime CreatedAt, bool IsBaseForAdditional);
public record StartRecordingDto(string SessionId, string Type, string Target);
public record CreateCheckpointDto(string SessionId, string Name);
