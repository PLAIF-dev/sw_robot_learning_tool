using RobotLearningTool.Domain.Models;

namespace RobotLearningTool.Application.Interfaces;

public interface ICameraService
{
    Task<List<CameraStatus>> GetChannelsAsync();
    Task<CameraFramePayload> GetFrameAsync(string channel);
    Task<CameraStatus> GetSettingsAsync(string channel);
    Task UpdateSettingsAsync(string channel, int width, int height, int fps);
}

public sealed record CameraFramePayload(byte[] Content, string ContentType, string Channel, int FrameIndex);
