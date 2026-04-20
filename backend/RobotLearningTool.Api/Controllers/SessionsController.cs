using Microsoft.AspNetCore.Mvc;
using RobotLearningTool.Application.Dtos;
using RobotLearningTool.Application.Interfaces;
using RobotLearningTool.Domain.Models;

namespace RobotLearningTool.Api.Controllers;

[ApiController]
[Route("api/sessions")]
public class SessionsController : ControllerBase
{
    private readonly ISessionService _sessionService;

    public SessionsController(ISessionService sessionService)
    {
        _sessionService = sessionService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var sessions = await _sessionService.GetAllAsync();
        return Ok(sessions.Select(ToSummaryDto));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var session = await _sessionService.GetByIdAsync(id);
        if (session is null)
        {
            return NotFound(SessionNotFound());
        }

        return Ok(ToDetailDto(session));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSessionDto request)
    {
        if (!Enum.TryParse<SessionMode>(request.Mode, true, out var mode))
        {
            return BadRequest(new { error = new { code = "INVALID_MODE", message = "지원하지 않는 세션 모드입니다." } });
        }

        var session = await _sessionService.CreateAsync(request.Name, mode, request.Description, request.BaseCheckpointId);
        return CreatedAtAction(nameof(GetById), new { id = session.Id }, ToDetailDto(session));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateSessionDto request)
    {
        try
        {
            var session = await _sessionService.UpdateAsync(id, request.Name, request.Description);
            return Ok(ToDetailDto(session));
        }
        catch (InvalidOperationException)
        {
            return NotFound(SessionNotFound());
        }
    }

    [HttpPost("{id}/duplicate")]
    public async Task<IActionResult> Duplicate(string id)
    {
        try
        {
            var session = await _sessionService.DuplicateAsync(id);
            return Ok(ToDetailDto(session));
        }
        catch (InvalidOperationException)
        {
            return NotFound(SessionNotFound());
        }
    }

    [HttpGet("{id}/state")]
    public async Task<IActionResult> GetState(string id)
    {
        var session = await _sessionService.GetByIdAsync(id);
        if (session is null)
        {
            return NotFound(SessionNotFound());
        }

        return Ok(new
        {
            sessionId = session.Id,
            isActive = session.IsActive,
            currentStage = session.CurrentStage.ToString(),
            mode = session.Mode.ToString(),
            updatedAt = session.UpdatedAt
        });
    }

    [HttpPost("{id}/activate")]
    public async Task<IActionResult> Activate(string id)
    {
        try
        {
            await _sessionService.SetActiveAsync(id);
            return Ok(new { message = "현재 세션으로 활성화했습니다." });
        }
        catch (InvalidOperationException)
        {
            return NotFound(SessionNotFound());
        }
    }

    private static SessionSummaryDto ToSummaryDto(Session session) =>
        new(session.Id, session.Name, session.Mode.ToString(), session.CurrentStage.ToString(), session.IsActive, session.CreatedAt);

    private static SessionDetailDto ToDetailDto(Session session) =>
        new(session.Id, session.Name, session.Mode.ToString(), session.Description, session.CurrentStage.ToString(), session.IsActive, session.CreatedAt, session.UpdatedAt, session.BaseCheckpointId);

    private static object SessionNotFound() => new
    {
        error = new
        {
            code = "SESSION_NOT_FOUND",
            message = "세션을 찾을 수 없습니다."
        }
    };
}
