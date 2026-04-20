namespace RobotLearningTool.Application.Dtos;

public record SessionSummaryDto(string Id, string Name, string Mode, string CurrentStage, bool IsActive, DateTime CreatedAt);
public record SessionDetailDto(string Id, string Name, string Mode, string Description, string CurrentStage, bool IsActive, DateTime CreatedAt, DateTime UpdatedAt, string? BaseCheckpointId);
public record CreateSessionDto(string Name, string Mode, string Description, string? BaseCheckpointId);
public record UpdateSessionDto(string Name, string Description);
