using System.Text.Json.Serialization;
using RobotLearningTool.Application.Interfaces;
using RobotLearningTool.Application.Services;
using RobotLearningTool.Infrastructure.Middleware;
using RobotLearningTool.Infrastructure.Mock;

var builder = WebApplication.CreateBuilder(args);
var defaultUrls = Environment.GetEnvironmentVariable("ASPNETCORE_URLS") ?? "http://localhost:8080";

builder.WebHost.UseUrls(defaultUrls);

builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
    {
        policy
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .SetIsOriginAllowed(origin =>
                origin.StartsWith("http://localhost:5173", StringComparison.OrdinalIgnoreCase) ||
                origin.StartsWith("http://127.0.0.1:5173", StringComparison.OrdinalIgnoreCase));
    });
});

builder.Services.AddSingleton<IAuthService>(_ =>
    new MockAuthService(builder.Configuration["Auth:Password"] ?? Environment.GetEnvironmentVariable("AUTH_PASSWORD") ?? "1111"));
builder.Services.AddSingleton<ITaskService, MockTaskService>();
builder.Services.AddSingleton<IDeviceService, MockDeviceService>();
builder.Services.AddSingleton<ICameraService>(_ =>
    new MockCameraService(Path.Combine(builder.Environment.ContentRootPath, "MockAssets", "camera-frames")));
builder.Services.AddSingleton<ITrainingService, MockTrainingService>();
builder.Services.AddSingleton<IMotionRecordService, MockMotionRecordService>();
builder.Services.AddSingleton<ICheckpointService, MockCheckpointService>();
builder.Services.AddSingleton<IRobotControlService, RobotControlService>();

var robotControlProvider = builder.Configuration["RobotControl:Provider"] ?? "Mock";
if (string.Equals(robotControlProvider, "Middleware", StringComparison.OrdinalIgnoreCase))
{
    builder.Services.AddSingleton<IRobotMiddlewareClient, RobotMiddlewareClient>();
}
else
{
    builder.Services.AddSingleton<IRobotMiddlewareClient, MockRobotMiddlewareClient>();
}

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.MapOpenApi();

app.UseCors("frontend");
app.UseAuthorization();
app.MapControllers();

app.MapGet("/health", () => Results.Ok(new
{
    status = "ok",
    service = "robot-learning-tool-backend",
    timestamp = DateTimeOffset.UtcNow
}));

app.MapGet("/ops", () => Results.Content(
    """
    <!doctype html>
    <html lang="ko">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Robot Learning Tool Ops</title>
      <style>
        body{font-family:Segoe UI,sans-serif;background:#0f172a;color:#e2e8f0;margin:0;padding:24px}
        h1{margin:0 0 16px}
        .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}
        .card{background:#111827;border:1px solid #334155;border-radius:16px;padding:16px}
        .label{font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#94a3b8}
        pre{white-space:pre-wrap;word-break:break-word}
      </style>
    </head>
    <body>
      <h1>Ops Status</h1>
      <div class="grid">
        <div class="card"><div class="label">Dashboard</div><pre id="dashboard">Loading...</pre></div>
        <div class="card"><div class="label">Devices</div><pre id="devices">Loading...</pre></div>
        <div class="card"><div class="label">Training Stage</div><pre id="stage">Loading...</pre></div>
        <div class="card"><div class="label">ROI</div><pre id="roi">Loading...</pre></div>
        <div class="card"><div class="label">Logs</div><pre id="logs">Loading...</pre></div>
      </div>
      <script>
        async function load(id, url){
          const res = await fetch(url);
          const data = await res.json();
          document.getElementById(id).textContent = JSON.stringify(data, null, 2);
        }
        async function refresh(){
          await Promise.all([
            load('dashboard','/api/dashboard/summary'),
            load('devices','/api/devices/status'),
            load('stage','/api/training/current-stage'),
            load('roi','/api/training/roi'),
            load('logs','/api/system/logs/recent')
          ]);
        }
        refresh();
        setInterval(refresh, 5000);
      </script>
    </body>
    </html>
    """,
    "text/html"));

app.Run();
