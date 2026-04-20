using Microsoft.AspNetCore.Mvc;
using RobotLearningTool.Application.Dtos;
using RobotLearningTool.Application.Interfaces;

namespace RobotLearningTool.Api.Controllers;

[ApiController]
[Route("api/records")]
public class RecordsController : ControllerBase
{
    private readonly IMotionRecordService _motionRecordService;
    private readonly ITrainingService _trainingService;

    public RecordsController(IMotionRecordService motionRecordService, ITrainingService trainingService)
    {
        _motionRecordService = motionRecordService;
        _trainingService = trainingService;
    }

    [HttpPost("motion/start")]
    public async Task<IActionResult> StartMotion([FromBody] StartRecordingDto request)
    {
        var record = await _motionRecordService.StartRecordingAsync(request.SessionId, request.Type, request.Target);
        return Ok(ToMotionDto(record));
    }

    [HttpPost("motion/stop")]
    public async Task<IActionResult> StopMotion([FromBody] StopRecordingRequest request)
    {
        try
        {
            var record = await _motionRecordService.StopRecordingAsync(request.Id);
            return Ok(ToMotionDto(record));
        }
        catch (InvalidOperationException)
        {
            return NotFound(RecordNotFound());
        }
    }

    [HttpGet("motion")]
    public async Task<IActionResult> GetMotion([FromQuery] string? sessionId = null)
    {
        var records = await _motionRecordService.GetAllAsync(sessionId);
        return Ok(records.Select(ToMotionDto));
    }

    [HttpGet("motion/{id}")]
    public async Task<IActionResult> GetMotionById(string id)
    {
        var record = await _motionRecordService.GetByIdAsync(id);
        if (record is null)
        {
            return NotFound(RecordNotFound());
        }

        return Ok(ToMotionDto(record));
    }

    [HttpDelete("motion/{id}")]
    public async Task<IActionResult> DeleteMotion(string id)
    {
        await _motionRecordService.DeleteAsync(id);
        return Ok(new { message = "모션 기록을 삭제했습니다." });
    }

    [HttpGet("motion/{id}/playback")]
    public async Task<IActionResult> GetMotionPlayback(string id)
    {
        var frames = await _motionRecordService.GetPlaybackAsync(id);
        return Ok(frames.Select(frame => new PlaybackFrameDto(
            frame.TimeOffset,
            new TcpPoseDto(frame.LeftTcp.X, frame.LeftTcp.Y, frame.LeftTcp.Z, frame.LeftTcp.Roll, frame.LeftTcp.Pitch, frame.LeftTcp.Yaw),
            new TcpPoseDto(frame.RightTcp.X, frame.RightTcp.Y, frame.RightTcp.Z, frame.RightTcp.Roll, frame.RightTcp.Pitch, frame.RightTcp.Yaw),
            frame.LeftJoints,
            frame.RightJoints
        )));
    }

    [HttpGet("demos")]
    public async Task<IActionResult> GetDemos()
    {
        var demos = await _trainingService.GetDemosAsync();
        return Ok(demos.Select(item => new DemoRecordDto(item.Id, item.SessionId, item.StartedAt, item.EndedAt, item.MarkedSuccess)));
    }

    [HttpGet("demos/{id}")]
    public async Task<IActionResult> GetDemo(string id)
    {
        var demo = await _trainingService.GetDemoByIdAsync(id);
        if (demo is null)
        {
            return NotFound(RecordNotFound());
        }

        return Ok(new DemoRecordDto(demo.Id, demo.SessionId, demo.StartedAt, demo.EndedAt, demo.MarkedSuccess));
    }

    [HttpGet("demos/{id}/playback")]
    public async Task<IActionResult> GetDemoPlayback(string id)
    {
        var demo = await _trainingService.GetDemoByIdAsync(id);
        if (demo is null)
        {
            return NotFound(RecordNotFound());
        }

        return await GetMotionPlayback(demo.MotionRecordId);
    }

    [HttpDelete("demos/{id}")]
    public async Task<IActionResult> DeleteDemo(string id)
    {
        await _trainingService.DeleteDemoAsync(id);
        return Ok(new { message = "데모 기록을 삭제했습니다." });
    }

    [HttpGet("episodes")]
    public async Task<IActionResult> GetEpisodes()
    {
        var episodes = await _trainingService.GetEpisodesAsync();
        return Ok(episodes.Select(item => new EpisodeRecordDto(item.Id, item.SessionId, item.EpisodeNumber, item.Success, item.DurationSeconds, item.StartedAt, item.Notes)));
    }

    [HttpGet("episodes/{id}")]
    public async Task<IActionResult> GetEpisode(string id)
    {
        var episode = await _trainingService.GetEpisodeByIdAsync(id);
        if (episode is null)
        {
            return NotFound(RecordNotFound());
        }

        return Ok(new EpisodeRecordDto(episode.Id, episode.SessionId, episode.EpisodeNumber, episode.Success, episode.DurationSeconds, episode.StartedAt, episode.Notes));
    }

    [HttpGet("episodes/{id}/playback")]
    public async Task<IActionResult> GetEpisodePlayback(string id)
    {
        var episode = await _trainingService.GetEpisodeByIdAsync(id);
        if (episode?.MotionRecordId is null)
        {
            return NotFound(RecordNotFound());
        }

        return await GetMotionPlayback(episode.MotionRecordId);
    }

    [HttpPatch("episodes/{id}")]
    public async Task<IActionResult> UpdateEpisode(string id, [FromBody] UpdateEpisodeRequest request)
    {
        try
        {
            await _trainingService.UpdateEpisodeAsync(id, request.Success, request.Notes);
            return Ok(new { message = "에피소드를 수정했습니다." });
        }
        catch (InvalidOperationException)
        {
            return NotFound(RecordNotFound());
        }
    }

    [HttpDelete("episodes/{id}")]
    public async Task<IActionResult> DeleteEpisode(string id)
    {
        await _trainingService.DeleteEpisodeAsync(id);
        return Ok(new { message = "에피소드를 삭제했습니다." });
    }

    [HttpGet("interventions")]
    public async Task<IActionResult> GetInterventions()
    {
        var interventions = await _trainingService.GetInterventionsAsync();
        return Ok(interventions.Select(item => new
        {
            item.Id,
            item.SessionId,
            item.EpisodeId,
            createdAt = item.OccurredAt,
            item.Reason,
            item.MotionRecordId
        }));
    }

    [HttpGet("interventions/{id}")]
    public async Task<IActionResult> GetIntervention(string id)
    {
        var intervention = await _trainingService.GetInterventionByIdAsync(id);
        if (intervention is null)
        {
            return NotFound(RecordNotFound());
        }

        return Ok(new
        {
            intervention.Id,
            intervention.SessionId,
            intervention.EpisodeId,
            createdAt = intervention.OccurredAt,
            intervention.Reason,
            intervention.MotionRecordId
        });
    }

    [HttpGet("interventions/{id}/playback")]
    public async Task<IActionResult> GetInterventionPlayback(string id)
    {
        var intervention = await _trainingService.GetInterventionByIdAsync(id);
        if (intervention is null)
        {
            return NotFound(RecordNotFound());
        }

        return await GetMotionPlayback(intervention.MotionRecordId);
    }

    private static MotionRecordDto ToMotionDto(Domain.Models.MotionRecord record) =>
        new(record.Id, record.SessionId, record.Type, record.Target, record.StartedAt, record.EndedAt, record.Frames.Count);

    private static object RecordNotFound() => new
    {
        error = new
        {
            code = "RECORD_NOT_FOUND",
            message = "기록을 찾을 수 없습니다."
        }
    };

    public record StopRecordingRequest(string Id);
    public record UpdateEpisodeRequest(bool? Success, string? Notes);
}
