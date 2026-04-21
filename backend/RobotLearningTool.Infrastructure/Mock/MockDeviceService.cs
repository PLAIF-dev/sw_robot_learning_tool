using RobotLearningTool.Application.Interfaces;
using RobotLearningTool.Domain.Models;

namespace RobotLearningTool.Infrastructure.Mock;

public class MockDeviceService : IDeviceService
{
    private bool _leftHandGuideEnabled;
    private bool _rightHandGuideEnabled;

    public Task<DeviceStatus> GetStatusAsync()
    {
        return Task.FromResult(new DeviceStatus
        {
            LeftArm = new RobotStatus
            {
                Connected = true,
                State = "준비",
                HandGuideMode = _leftHandGuideEnabled
            },
            RightArm = new RobotStatus
            {
                Connected = true,
                State = "준비",
                HandGuideMode = _rightHandGuideEnabled
            },
            Controller = new ControllerStatus
            {
                Connected = true,
                State = "연결됨"
            },
            LeftCamera = new CameraStatus { Connected = true, Channel = "left", Width = 1280, Height = 720, Fps = 5 },
            RightCamera = new CameraStatus { Connected = true, Channel = "right", Width = 1280, Height = 720, Fps = 5 },
            HeadCamera = new CameraStatus { Connected = true, Channel = "head", Width = 1280, Height = 720, Fps = 5 },
            LeftGripper = new GripperStatus { Connected = true, OpenPercent = 82 },
            RightGripper = new GripperStatus { Connected = true, OpenPercent = 61 }
        });
    }

    public Task SetHandGuideModeAsync(string arm, bool enabled)
    {
        switch (arm.ToLowerInvariant())
        {
            case "left":
                _leftHandGuideEnabled = enabled;
                break;
            case "right":
                _rightHandGuideEnabled = enabled;
                break;
            default:
                _leftHandGuideEnabled = enabled;
                _rightHandGuideEnabled = enabled;
                break;
        }

        return Task.CompletedTask;
    }
}
