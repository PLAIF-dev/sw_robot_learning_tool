namespace RobotLearningTool.Application.Dtos;

public record TaskSummaryDto(string Id, string Name, string Mode, string CurrentStage, bool IsActive, DateTime CreatedAt);
public record TaskDetailDto(string Id, string Name, string Mode, string Description, string CurrentStage, bool IsActive, DateTime CreatedAt, DateTime UpdatedAt, string? BaseCheckpointId);
public record CreateTaskDto(string Name, string Mode, string Description, string? BaseCheckpointId);
public record UpdateTaskDto(string Name, string Description);
