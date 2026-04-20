using RobotLearningTool.Domain.Models;

namespace RobotLearningTool.Application.Interfaces;

public interface IMotionRecordService
{
    Task<MotionRecord> StartRecordingAsync(string sessionId, string type, string target);
    Task<MotionRecord> StopRecordingAsync(string id);
    Task<List<MotionRecord>> GetAllAsync(string? sessionId = null);
    Task<MotionRecord?> GetByIdAsync(string id);
    Task DeleteAsync(string id);
    Task<List<PlaybackFrame>> GetPlaybackAsync(string id);
}
