using RobotLearningTool.Domain.Models;

namespace RobotLearningTool.Application.Interfaces;

public interface ICameraService
{
    Task<List<CameraStatus>> GetChannelsAsync();
    Task<string> GetFrameBase64Async(string channel);
    Task<CameraStatus> GetSettingsAsync(string channel);
    Task UpdateSettingsAsync(string channel, int width, int height, int fps);
}
