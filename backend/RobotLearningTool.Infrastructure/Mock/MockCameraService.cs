using RobotLearningTool.Application.Interfaces;
using RobotLearningTool.Domain.Models;

namespace RobotLearningTool.Infrastructure.Mock;

public class MockCameraService : ICameraService
{
    private static readonly IReadOnlyDictionary<string, CameraStatus> DefaultSettings =
        new Dictionary<string, CameraStatus>(StringComparer.OrdinalIgnoreCase)
        {
            ["left"] = new() { Connected = true, Channel = "left", Width = 640, Height = 480, Fps = 10 },
            ["right"] = new() { Connected = true, Channel = "right", Width = 640, Height = 480, Fps = 10 },
            ["head"] = new() { Connected = true, Channel = "head", Width = 1280, Height = 720, Fps = 10 },
        };

    private static readonly string BluePixel = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    private static readonly string GreenPixel = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQAABjE+ibYAAAAASUVORK5CYII=";
    private static readonly string RedPixel = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==";

    private readonly string _framesRootPath;
    private readonly Dictionary<string, List<string>> _channelFrames;
    private readonly Dictionary<string, int> _channelFrameIndexes;
    private readonly Dictionary<string, CameraStatus> _settings;
    private readonly Lock _lock = new();

    public MockCameraService(string framesRootPath)
    {
        _framesRootPath = framesRootPath;
        _settings = DefaultSettings.ToDictionary(
            pair => pair.Key,
            pair => new CameraStatus
            {
                Connected = pair.Value.Connected,
                Channel = pair.Value.Channel,
                Width = pair.Value.Width,
                Height = pair.Value.Height,
                Fps = pair.Value.Fps,
            },
            StringComparer.OrdinalIgnoreCase);

        _channelFrames = new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase);
        _channelFrameIndexes = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

        foreach (var channel in _settings.Keys)
        {
            var frames = LoadChannelFrames(channel);
            _channelFrames[channel] = frames;
            _channelFrameIndexes[channel] = 0;
            _settings[channel].Connected = frames.Count > 0;
        }
    }

    public Task<List<CameraStatus>> GetChannelsAsync() =>
        Task.FromResult(_settings.Values
            .Select(status => new CameraStatus
            {
                Connected = status.Connected,
                Channel = status.Channel,
                Width = status.Width,
                Height = status.Height,
                Fps = status.Fps,
            })
            .ToList());

    public Task<string> GetFrameBase64Async(string channel)
    {
        if (!_channelFrames.TryGetValue(channel, out var frames) || frames.Count == 0)
        {
            return Task.FromResult(GetFallbackFrame(channel));
        }

        lock (_lock)
        {
            var nextIndex = _channelFrameIndexes[channel];
            var frame = frames[nextIndex];
            _channelFrameIndexes[channel] = (nextIndex + 1) % frames.Count;
            return Task.FromResult(frame);
        }
    }

    public Task<CameraStatus> GetSettingsAsync(string channel)
    {
        var normalizedChannel = _settings.ContainsKey(channel) ? channel : "left";
        var status = _settings[normalizedChannel];

        return Task.FromResult(new CameraStatus
        {
            Connected = status.Connected,
            Channel = status.Channel,
            Width = status.Width,
            Height = status.Height,
            Fps = status.Fps,
        });
    }

    public Task UpdateSettingsAsync(string channel, int width, int height, int fps)
    {
        if (_settings.TryGetValue(channel, out var status))
        {
            status.Width = width;
            status.Height = height;
            status.Fps = fps;
        }

        return Task.CompletedTask;
    }

    private List<string> LoadChannelFrames(string channel)
    {
        var channelDirectory = Path.Combine(_framesRootPath, channel);
        if (!Directory.Exists(channelDirectory))
        {
            return [];
        }

        var frameFiles = Directory
            .EnumerateFiles(channelDirectory, "*.*", SearchOption.TopDirectoryOnly)
            .Where(path =>
            {
                var extension = Path.GetExtension(path);
                return extension.Equals(".png", StringComparison.OrdinalIgnoreCase) ||
                       extension.Equals(".jpg", StringComparison.OrdinalIgnoreCase) ||
                       extension.Equals(".jpeg", StringComparison.OrdinalIgnoreCase) ||
                       extension.Equals(".webp", StringComparison.OrdinalIgnoreCase);
            })
            .OrderBy(path => path, StringComparer.OrdinalIgnoreCase)
            .ToList();

        return frameFiles
            .Select(File.ReadAllBytes)
            .Select(Convert.ToBase64String)
            .ToList();
    }

    private static string GetFallbackFrame(string channel) =>
        channel.ToLowerInvariant() switch
        {
            "right" => GreenPixel,
            "head" => RedPixel,
            _ => BluePixel,
        };
}
