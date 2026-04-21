using RobotLearningTool.Domain.Models;

namespace RobotLearningTool.Application.Interfaces;

public interface ITaskService
{
    Task<List<TaskItem>> GetAllAsync();
    Task<TaskItem?> GetByIdAsync(string id);
    Task<TaskItem> CreateAsync(string name, TaskMode mode, string description, string? baseCheckpointId);
    Task<TaskItem> UpdateAsync(string id, string name, string description);
    Task<TaskItem> DuplicateAsync(string id);
    Task SetActiveAsync(string id);
}
