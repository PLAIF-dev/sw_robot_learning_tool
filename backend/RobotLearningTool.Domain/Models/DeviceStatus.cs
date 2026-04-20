namespace RobotLearningTool.Domain.Models;

public class DeviceStatus
{
    public RobotStatus LeftArm { get; set; } = new();
    public RobotStatus RightArm { get; set; } = new();
    public ControllerStatus Controller { get; set; } = new();
    public CameraStatus LeftCamera { get; set; } = new();
    public CameraStatus RightCamera { get; set; } = new();
    public CameraStatus HeadCamera { get; set; } = new();
    public GripperStatus LeftGripper { get; set; } = new();
    public GripperStatus RightGripper { get; set; } = new();
}

public class RobotStatus
{
    public bool Connected { get; set; }
    public string State { get; set; } = string.Empty;
    public bool HandGuideMode { get; set; }
}

public class ControllerStatus
{
    public bool Connected { get; set; }
    public string State { get; set; } = string.Empty;
}

public class CameraStatus
{
    public bool Connected { get; set; }
    public string Channel { get; set; } = string.Empty;
    public int Width { get; set; }
    public int Height { get; set; }
    public int Fps { get; set; }
}

public class GripperStatus
{
    public bool Connected { get; set; }
    public float OpenPercent { get; set; }
}
