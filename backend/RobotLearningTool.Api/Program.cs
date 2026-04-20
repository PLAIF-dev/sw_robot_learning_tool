using System.Text.Json.Serialization;
using RobotLearningTool.Application.Interfaces;
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
builder.Services.AddSingleton<ISessionService, MockSessionService>();
builder.Services.AddSingleton<IDeviceService, MockDeviceService>();
builder.Services.AddSingleton<ICameraService>(_ =>
    new MockCameraService(Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "..", "robot_mock_frames"))));
builder.Services.AddSingleton<ITrainingService, MockTrainingService>();
builder.Services.AddSingleton<IMotionRecordService, MockMotionRecordService>();
builder.Services.AddSingleton<ICheckpointService, MockCheckpointService>();
builder.Services.AddSingleton<IIkService, MockIkService>();

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

app.Run();
