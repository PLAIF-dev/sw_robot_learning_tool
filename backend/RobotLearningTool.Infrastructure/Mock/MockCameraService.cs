using RobotLearningTool.Application.Interfaces;
using RobotLearningTool.Domain.Models;

namespace RobotLearningTool.Infrastructure.Mock;

public class MockCameraService : ICameraService
{
    private static readonly string _bluePixel = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    private static readonly string _greenPixel = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQAABjE+ibYAAAAASUVORK5CYII=";
    private static readonly string _redPixel = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==";

    private readonly Dictionary<string, string> _frames;
    private readonly Dictionary<string, CameraStatus> _settings;

    public MockCameraService()
    {
        _frames = new() { ["left"] = _bluePixel, ["right"] = _greenPixel, ["head"] = _redPixel };
        _settings = new()
        {
            ["left"] = new CameraStatus { Connected = true, Channel = "left", Width = 640, Height = 480, Fps = 30 },
            ["right"] = new CameraStatus { Connected = true, Channel = "right", Width = 640, Height = 480, Fps = 30 },
            ["head"] = new CameraStatus { Connected = true, Channel = "head", Width = 1280, Height = 720, Fps = 15 },
        };
    }

    public Task<List<CameraStatus>> GetChannelsAsync() => Task.FromResult(_settings.Values.ToList());

    public Task<string> GetFrameBase64Async(string channel) =>
        Task.FromResult(_frames.GetValueOrDefault(channel, _bluePixel));

    public Task<CameraStatus> GetSettingsAsync(string channel) =>
        Task.FromResult(_settings.GetValueOrDefault(channel, _settings["left"])!);

    public Task UpdateSettingsAsync(string channel, int width, int height, int fps)
    {
        if (_settings.TryGetValue(channel, out var s)) { s.Width = width; s.Height = height; s.Fps = fps; }
        return Task.CompletedTask;
    }
}
