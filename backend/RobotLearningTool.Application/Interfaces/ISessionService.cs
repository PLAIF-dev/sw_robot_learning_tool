using RobotLearningTool.Domain.Models;

namespace RobotLearningTool.Application.Interfaces;

public interface ISessionService
{
    Task<List<Session>> GetAllAsync();
    Task<Session?> GetByIdAsync(string id);
    Task<Session> CreateAsync(string name, SessionMode mode, string description, string? baseCheckpointId);
    Task<Session> UpdateAsync(string id, string name, string description);
    Task<Session> DuplicateAsync(string id);
    Task SetActiveAsync(string id);
}
