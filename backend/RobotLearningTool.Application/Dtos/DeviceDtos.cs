namespace RobotLearningTool.Application.Dtos;

public record DeviceStatusDto(
    RobotStatusDto LeftArm,
    RobotStatusDto RightArm,
    ControllerStatusDto Controller,
    CameraStatusDto LeftCamera,
    CameraStatusDto RightCamera,
    CameraStatusDto HeadCamera,
    GripperStatusDto LeftGripper,
    GripperStatusDto RightGripper);

public record RobotStatusDto(bool Connected, string State, bool HandGuideMode);
public record ControllerStatusDto(bool Connected, string State);
public record CameraStatusDto(bool Connected, string Channel, int Width, int Height, int Fps);
public record GripperStatusDto(bool Connected, float OpenPercent);
public record SetHandGuideModeDto(string Arm, bool Enabled);
