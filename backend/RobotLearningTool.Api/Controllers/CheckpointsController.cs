using Microsoft.AspNetCore.Mvc;
using RobotLearningTool.Application.Dtos;
using RobotLearningTool.Application.Interfaces;

namespace RobotLearningTool.Api.Controllers;

[ApiController]
[Route("api/checkpoints")]
public class CheckpointsController : ControllerBase
{
    private readonly ICheckpointService _checkpointService;

    public CheckpointsController(ICheckpointService checkpointService)
    {
        _checkpointService = checkpointService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var checkpoints = await _checkpointService.GetAllAsync();
        return Ok(checkpoints.Select(ToDto));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCheckpointDto request)
    {
        var checkpoint = await _checkpointService.CreateAsync(request.SessionId, request.Name);
        return CreatedAtAction(nameof(GetById), new { id = checkpoint.Id }, ToDto(checkpoint));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var checkpoint = await _checkpointService.GetByIdAsync(id);
        if (checkpoint is null)
        {
            return NotFound(new { error = new { code = "CHECKPOINT_NOT_AVAILABLE", message = "체크포인트를 찾을 수 없습니다." } });
        }

        return Ok(ToDto(checkpoint));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        await _checkpointService.DeleteAsync(id);
        return Ok(new { message = "체크포인트를 삭제했습니다." });
    }

    private static CheckpointDto ToDto(Domain.Models.Checkpoint checkpoint) =>
        new(
            checkpoint.Id,
            checkpoint.SessionId,
            checkpoint.Name,
            checkpoint.SuccessRate,
            checkpoint.AverageDuration,
            checkpoint.TotalEpisodes,
            checkpoint.CreatedAt,
            checkpoint.IsBaseForAdditional);
}
