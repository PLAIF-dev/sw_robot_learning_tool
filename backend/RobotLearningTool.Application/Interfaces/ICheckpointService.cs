using RobotLearningTool.Domain.Models;

namespace RobotLearningTool.Application.Interfaces;

public interface ICheckpointService
{
    Task<List<Checkpoint>> GetAllAsync();
    Task<Checkpoint> CreateAsync(string sessionId, string name);
    Task<Checkpoint?> GetByIdAsync(string id);
    Task DeleteAsync(string id);
}
