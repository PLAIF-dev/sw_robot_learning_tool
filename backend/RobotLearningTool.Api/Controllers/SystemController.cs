using Microsoft.AspNetCore.Mvc;

namespace RobotLearningTool.Api.Controllers;

[ApiController]
[Route("api/system")]
public class SystemController : ControllerBase
{
    private static readonly List<string> RecentLogs =
    [
        "[2026-04-20 09:00:01] INFO: 시스템 시작",
        "[2026-04-20 09:00:02] INFO: Mock 서비스 초기화 완료",
        "[2026-04-20 09:00:03] INFO: 좌측 로봇 연결됨",
        "[2026-04-20 09:00:03] INFO: 우측 로봇 연결됨",
        "[2026-04-20 09:00:04] INFO: 카메라 left 연결됨 (640x480@30fps)",
        "[2026-04-20 09:00:04] INFO: 카메라 right 연결됨 (640x480@30fps)",
        "[2026-04-20 09:00:04] INFO: 카메라 head 연결됨 (1280x720@15fps)",
        "[2026-04-20 09:00:05] INFO: 컨트롤러 연결됨",
        "[2026-04-20 09:05:12] INFO: 데모 기록 시작",
        "[2026-04-20 09:05:45] INFO: 데모 기록 종료 (33초)",
        "[2026-04-20 09:15:00] INFO: 체크포인트 Checkpoint-02 저장",
        "[2026-04-20 09:20:00] INFO: 학습 세션 평가 완료"
    ];

    [HttpGet("info")]
    public IActionResult GetInfo()
    {
        return Ok(new
        {
            version = "0.1.0",
            environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development",
            dotnetVersion = Environment.Version.ToString(),
            machineName = Environment.MachineName,
            backendPort = 8080
        });
    }

    [HttpGet("logs/recent")]
    public IActionResult GetRecentLogs()
    {
        return Ok(RecentLogs);
    }
}
