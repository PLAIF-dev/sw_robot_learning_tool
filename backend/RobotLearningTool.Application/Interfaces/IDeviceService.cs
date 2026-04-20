using RobotLearningTool.Domain.Models;

namespace RobotLearningTool.Application.Interfaces;

public interface IDeviceService
{
    Task<DeviceStatus> GetStatusAsync();
    Task SetHandGuideModeAsync(string arm, bool enabled);
}
