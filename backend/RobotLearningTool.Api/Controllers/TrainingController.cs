using Microsoft.AspNetCore.Mvc;
using RobotLearningTool.Application.Interfaces;
using RobotLearningTool.Application.Models;
using RobotLearningTool.Domain.Models;

namespace RobotLearningTool.Api.Controllers;

[ApiController]
[Route("api/training")]
public class TrainingController : ControllerBase
{
    private readonly ITrainingService _trainingService;

    public TrainingController(ITrainingService trainingService)
    {
        _trainingService = trainingService;
    }

    [HttpGet("current-stage")]
    public async Task<IActionResult> GetCurrentStage()
    {
        var stage = await _trainingService.GetCurrentStageAsync();
        return Ok(new { stage = stage.ToString() });
    }

    [HttpPut("current-stage")]
    public async Task<IActionResult> SetCurrentStage([FromBody] SetStageRequest request)
    {
        if (!Enum.TryParse<TrainingStage>(request.Stage, true, out var stage))
        {
            return BadRequest(new { error = new { code = "INVALID_STAGE", message = "지원하지 않는 학습 단계입니다." } });
        }

        await _trainingService.SetCurrentStageAsync(stage);
        return Ok(new { message = "학습 단계를 변경했습니다.", stage = stage.ToString() });
    }

    [HttpGet("environment")]
    public async Task<IActionResult> GetEnvironment()
    {
        return Ok(await _trainingService.GetEnvironmentAsync());
    }

    [HttpPut("environment")]
    public async Task<IActionResult> SaveEnvironment([FromBody] TrainingEnvironmentConfig config)
    {
        await _trainingService.SaveEnvironmentAsync(config);
        return Ok(new { message = "기본 환경 설정을 저장했습니다." });
    }

    [HttpGet("roi")]
    public async Task<IActionResult> GetRoi()
    {
        return Ok(await _trainingService.GetRoiSettingsAsync());
    }

    [HttpPut("roi/{channel}")]
    public async Task<IActionResult> SaveRoi(string channel, [FromBody] SaveRoiRequest request)
    {
        var roi = await _trainingService.SaveRoiSettingAsync(channel, new RoiRectangle
        {
            Channel = channel,
            X = request.X,
            Y = request.Y,
            Width = request.Width,
            Height = request.Height
        });

        return Ok(roi);
    }

    [HttpGet("classifier")]
    public async Task<IActionResult> GetClassifier()
    {
        return Ok(await _trainingService.GetClassifierStatusAsync());
    }

    [HttpPost("classifier/collect")]
    public async Task<IActionResult> CollectClassifier([FromBody] CollectClassifierRequest request)
    {
        await _trainingService.CollectClassifierSampleAsync(request.Label);
        return Ok(new { message = "분류기 샘플을 수집했습니다.", label = request.Label });
    }

    [HttpPost("classifier/reset")]
    public async Task<IActionResult> ResetClassifier()
    {
        await _trainingService.ResetClassifierAsync();
        return Ok(new { message = "분류기 데이터를 초기화했습니다." });
    }

    [HttpGet("demo")]
    public async Task<IActionResult> GetDemo()
    {
        return Ok(await _trainingService.GetDemoStatusAsync());
    }

    [HttpPost("demo/start")]
    public async Task<IActionResult> StartDemo()
    {
        await _trainingService.StartDemoAsync();
        return Ok(new { message = "데모 수집을 시작했습니다." });
    }

    [HttpPost("demo/mark-success")]
    public async Task<IActionResult> MarkDemoSuccess()
    {
        await _trainingService.MarkDemoSuccessAsync();
        return Ok(new { message = "현재 데모를 성공으로 표시했습니다." });
    }

    [HttpPost("demo/end")]
    public async Task<IActionResult> EndDemo()
    {
        await _trainingService.EndDemoAsync();
        return Ok(new { message = "데모 수집을 종료했습니다." });
    }

    [HttpDelete("demo/{id}")]
    public async Task<IActionResult> DeleteDemo(string id)
    {
        await _trainingService.DeleteDemoAsync(id);
        return Ok(new { message = "데모 기록을 삭제했습니다." });
    }

    [HttpGet("main")]
    public async Task<IActionResult> GetMain()
    {
        return Ok(await _trainingService.GetMainStatusAsync());
    }

    [HttpPost("main/start")]
    public async Task<IActionResult> StartMain()
    {
        await _trainingService.StartMainTrainingAsync();
        return Ok(new { message = "본 학습을 시작했습니다." });
    }

    [HttpPost("main/stop")]
    public async Task<IActionResult> StopMain()
    {
        await _trainingService.StopMainTrainingAsync();
        return Ok(new { message = "본 학습을 중지했습니다." });
    }

    [HttpPost("main/mark-result")]
    public async Task<IActionResult> MarkResult([FromBody] MarkResultRequest request)
    {
        await _trainingService.MarkEpisodeResultAsync(request.Success);
        return Ok(new { message = "에피소드 결과를 기록했습니다.", success = request.Success });
    }

    [HttpDelete("main/episodes/{id}")]
    public async Task<IActionResult> DeleteEpisode(string id)
    {
        await _trainingService.DeleteEpisodeAsync(id);
        return Ok(new { message = "에피소드를 삭제했습니다." });
    }

    [HttpGet("evaluation")]
    public async Task<IActionResult> GetEvaluation()
    {
        return Ok(await _trainingService.GetEvaluationAsync());
    }

    public record SetStageRequest(string Stage);
    public record SaveRoiRequest(float X, float Y, float Width, float Height);
    public record CollectClassifierRequest(string Label);
    public record MarkResultRequest(bool Success);
}
