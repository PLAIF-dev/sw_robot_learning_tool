using RobotLearningTool.Application.Models;
using RobotLearningTool.Domain.Models;

namespace RobotLearningTool.Application.Interfaces;

public interface ITrainingService
{
    Task<TrainingStage> GetCurrentStageAsync();
    Task SetCurrentStageAsync(TrainingStage stage);
    Task<TrainingEnvironmentConfig> GetEnvironmentAsync();
    Task SaveEnvironmentAsync(TrainingEnvironmentConfig config);
    Task<ClassifierStatus> GetClassifierStatusAsync();
    Task CollectClassifierSampleAsync(string label);
    Task ResetClassifierAsync();
    Task<DemoStatus> GetDemoStatusAsync();
    Task StartDemoAsync();
    Task MarkDemoSuccessAsync();
    Task EndDemoAsync();
    Task DeleteDemoAsync(string id);
    Task<MainTrainingStatus> GetMainStatusAsync();
    Task StartMainTrainingAsync();
    Task StopMainTrainingAsync();
    Task MarkEpisodeResultAsync(bool success);
    Task DeleteEpisodeAsync(string id);
    Task<EvaluationSummary> GetEvaluationAsync();
    Task<List<DemoRecord>> GetDemosAsync();
    Task<DemoRecord?> GetDemoByIdAsync(string id);
    Task<List<EpisodeRecord>> GetEpisodesAsync();
    Task<EpisodeRecord?> GetEpisodeByIdAsync(string id);
    Task UpdateEpisodeAsync(string id, bool? success, string? notes);
    Task<List<InterventionRecord>> GetInterventionsAsync();
    Task<InterventionRecord?> GetInterventionByIdAsync(string id);
}
