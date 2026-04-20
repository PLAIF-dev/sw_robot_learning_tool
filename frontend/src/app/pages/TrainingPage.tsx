import { useEffect, useMemo, useState } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { TRAINING_STAGES } from '../constants'
import { trainingApi } from '../api/training'
import type {
  ClassifierStatus,
  DemoStatus,
  EvaluationSummary,
  MainTrainingStatus,
  TrainingEnvironment,
  TrainingStage,
} from '../types'
import { CameraPanel } from '../components/camera/CameraPanel'
import { RobotViewer3D } from '../components/robot/RobotViewer3D'
import { useControlStore } from '../store/controlStore'
import { useKeyboardTcp } from '../hooks/useKeyboardTcp'

export function TrainingPage() {
  const leftJoints = useControlStore((state) => state.leftJoints)
  const rightJoints = useControlStore((state) => state.rightJoints)
  const selectedTarget = useControlStore((state) => state.target)
  const refreshControl = useControlStore((state) => state.refresh)

  const [stage, setStage] = useState<TrainingStage>('Environment')
  const [environment, setEnvironment] = useState<TrainingEnvironment | null>(null)
  const [classifier, setClassifier] = useState<ClassifierStatus | null>(null)
  const [demo, setDemo] = useState<DemoStatus | null>(null)
  const [mainTraining, setMainTraining] = useState<MainTrainingStatus | null>(null)
  const [evaluation, setEvaluation] = useState<EvaluationSummary | null>(null)

  useKeyboardTcp(true)

  async function refresh() {
    const [stageResponse, nextEnvironment, nextClassifier, nextDemo, nextMain, nextEvaluation] = await Promise.all([
      trainingApi.getCurrentStage(),
      trainingApi.getEnvironment(),
      trainingApi.getClassifier(),
      trainingApi.getDemo(),
      trainingApi.getMain(),
      trainingApi.getEvaluation(),
    ])

    setStage(stageResponse.stage)
    setEnvironment(nextEnvironment)
    setClassifier(nextClassifier)
    setDemo(nextDemo)
    setMainTraining(nextMain)
    setEvaluation(nextEvaluation)
    await refreshControl()
  }

  useEffect(() => {
    void refresh()
  }, [])

  const chartData = useMemo(
    () =>
      (mainTraining?.recentEpisodes ?? []).map((episode) => ({
        name: `EP ${episode.episodeNumber}`,
        duration: episode.durationSeconds ?? 0,
        success: episode.success ? 1 : 0,
      })),
    [mainTraining?.recentEpisodes],
  )

  async function changeStage(nextStage: TrainingStage) {
    setStage(nextStage)
    await trainingApi.setCurrentStage(nextStage)
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
      <aside className="panel p-4">
        <div className="section-title">학습 실행 단계</div>
        <div className="mt-4 space-y-2">
          {TRAINING_STAGES.map((item) => (
            <button
              key={item.key}
              className={`stage-button w-full ${stage === item.key ? 'stage-button-active' : 'stage-button-inactive'}`}
              onClick={() => void changeStage(item.key)}
            >
              <div>
                <div className="font-medium">{item.label}</div>
                <div className="mt-1 text-xs text-slate-400">{item.hint}</div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section className="space-y-6">
        {stage === 'Environment' && environment && (
          <div className="panel p-6">
            <div className="section-title">기본 환경 설정</div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="panel-muted p-4">
                <div className="text-sm text-slate-300">로봇 설정</div>
                <input className="mt-3 w-full rounded-xl bg-transparent text-slate-100" value={environment.robotModel} onChange={(e) => setEnvironment({ ...environment, robotModel: e.target.value })} />
              </label>
              <label className="panel-muted p-4">
                <div className="text-sm text-slate-300">카메라 설정</div>
                <input className="mt-3 w-full rounded-xl bg-transparent text-slate-100" value={environment.cameraResolution} onChange={(e) => setEnvironment({ ...environment, cameraResolution: e.target.value })} />
              </label>
              <label className="panel-muted p-4">
                <div className="text-sm text-slate-300">그리퍼 설정</div>
                <input className="mt-3 w-full rounded-xl bg-transparent text-slate-100" value={environment.gripperType} onChange={(e) => setEnvironment({ ...environment, gripperType: e.target.value })} />
              </label>
              <label className="panel-muted p-4">
                <div className="text-sm text-slate-300">제어 장치 설정</div>
                <input className="mt-3 w-full rounded-xl bg-transparent text-slate-100" value={environment.controllerType} onChange={(e) => setEnvironment({ ...environment, controllerType: e.target.value })} />
              </label>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="panel-muted p-4">
                <div className="text-sm text-slate-300">Learning Rate</div>
                <input className="mt-3 w-full rounded-xl bg-transparent text-slate-100" type="number" value={environment.learningRate} onChange={(e) => setEnvironment({ ...environment, learningRate: Number(e.target.value) })} />
              </label>
              <label className="panel-muted p-4">
                <div className="text-sm text-slate-300">Batch Size</div>
                <input className="mt-3 w-full rounded-xl bg-transparent text-slate-100" type="number" value={environment.batchSize} onChange={(e) => setEnvironment({ ...environment, batchSize: Number(e.target.value) })} />
              </label>
              <label className="panel-muted p-4">
                <div className="text-sm text-slate-300">Max Episodes</div>
                <input className="mt-3 w-full rounded-xl bg-transparent text-slate-100" type="number" value={environment.maxEpisodes} onChange={(e) => setEnvironment({ ...environment, maxEpisodes: Number(e.target.value) })} />
              </label>
            </div>
            <div className="mt-6 flex gap-3">
              <button className="rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white" onClick={() => void trainingApi.saveEnvironment(environment)}>
                저장
              </button>
              <button className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200" onClick={() => void changeStage('Classifier')}>
                다음 단계
              </button>
            </div>
          </div>
        )}

        {stage === 'Classifier' && classifier && (
          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <div className="panel p-6">
              <div className="section-title">Classifier 학습</div>
              <div className="mt-4">
                <CameraPanel layout="single" singleChannel="head" />
              </div>
            </div>
            <div className="panel p-6">
              <div className="grid gap-3">
                <div className="panel-muted p-4">
                  <div className="text-sm text-slate-300">수집 현황</div>
                  <div className="mt-3 space-y-2 text-sm text-slate-200">
                    <div>성공: {classifier.successCount}</div>
                    <div>실패: {classifier.failureCount}</div>
                    <div>영역 이탈: {classifier.outOfRangeCount}</div>
                    <div>최소 조건: {classifier.minRequired}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button className="rounded-xl bg-emerald-500 px-3 py-2 text-sm text-white" onClick={() => void trainingApi.collectClassifier('success').then(refresh)}>
                    성공
                  </button>
                  <button className="rounded-xl bg-rose-500 px-3 py-2 text-sm text-white" onClick={() => void trainingApi.collectClassifier('failure').then(refresh)}>
                    실패
                  </button>
                  <button className="rounded-xl bg-amber-500 px-3 py-2 text-sm text-white" onClick={() => void trainingApi.collectClassifier('out_of_range').then(refresh)}>
                    영역 이탈
                  </button>
                </div>
                <button className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200" onClick={() => void trainingApi.resetClassifier().then(refresh)}>
                  분류기 초기화
                </button>
              </div>
            </div>
          </div>
        )}

        {stage === 'Demo' && demo && (
          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="panel p-6">
                <div className="section-title">카메라 뷰</div>
                <div className="mt-4">
                  <CameraPanel layout="single" singleChannel="head" />
                </div>
              </div>
              <div className="panel p-6">
                <div className="section-title">3D 로봇 뷰어</div>
                <div className="mt-4">
                  <RobotViewer3D leftJoints={leftJoints} rightJoints={rightJoints} selectedTarget={selectedTarget} />
                </div>
              </div>
            </div>
            <div className="panel p-6">
              <div className="flex flex-wrap gap-3">
                <button className="rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white" onClick={() => void trainingApi.startDemo().then(refresh)}>
                  데모 시작
                </button>
                <button className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white" onClick={() => void trainingApi.markDemoSuccess().then(refresh)}>
                  성공 입력
                </button>
                <button className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200" onClick={() => void trainingApi.endDemo().then(refresh)}>
                  데모 종료
                </button>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="panel-muted p-4">현재 상태: {demo.isRecording ? '수집 중' : '대기'}</div>
                <div className="panel-muted p-4">데모 수량: {demo.demoCount}</div>
                <div className="panel-muted p-4">최소 조건: {demo.minRequired}</div>
              </div>
              <div className="mt-4 space-y-2">
                {demo.demos.map((item) => (
                  <div key={item.id} className="panel-muted flex items-center justify-between p-3 text-sm">
                    <span>{item.id}</span>
                    <span>{item.markedSuccess === true ? '성공' : item.markedSuccess === false ? '실패' : '미지정'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {stage === 'MainTraining' && mainTraining && (
          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="panel p-6">
                <div className="section-title">실시간 카메라 뷰</div>
                <div className="mt-4">
                  <CameraPanel layout="triple" />
                </div>
              </div>
              <div className="panel p-6">
                <div className="section-title">3D 로봇 뷰어</div>
                <div className="mt-4">
                  <RobotViewer3D leftJoints={leftJoints} rightJoints={rightJoints} selectedTarget={selectedTarget} />
                </div>
              </div>
            </div>
            <div className="panel p-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="panel-muted p-4"><div className="section-title">현재 상태</div><div className="metric-value mt-3">{mainTraining.isRunning ? 'RUN' : 'STOP'}</div></div>
                <div className="panel-muted p-4"><div className="section-title">총 에피소드</div><div className="metric-value mt-3">{mainTraining.totalEpisodes}</div></div>
                <div className="panel-muted p-4"><div className="section-title">성공률</div><div className="metric-value mt-3">{Math.round(mainTraining.successRate * 100)}%</div></div>
                <div className="panel-muted p-4"><div className="section-title">평균 시간</div><div className="metric-value mt-3">{mainTraining.averageDuration.toFixed(1)}s</div></div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white" onClick={() => void trainingApi.startMain().then(refresh)}>학습 시작</button>
                <button className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200" onClick={() => void trainingApi.stopMain().then(refresh)}>학습 중지</button>
                <button className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white" onClick={() => void trainingApi.markResult(true).then(refresh)}>성공 입력</button>
                <button className="rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white" onClick={() => void trainingApi.markResult(false).then(refresh)}>실패 입력</button>
              </div>
              <div className="mt-6 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip />
                    <Area dataKey="duration" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {stage === 'Evaluation' && evaluation && (
          <div className="panel p-6">
            <div className="section-title">평가 / 완료 상태</div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: '환경 구성', ok: evaluation.environmentConfigured },
                { label: 'Classifier 학습', ok: evaluation.classifierTrained },
                { label: '데모 수집', ok: evaluation.demoCollected },
                { label: '본 학습 완료', ok: evaluation.trainingCompleted },
              ].map(({ label, ok }) => (
                <div key={label} className="panel-muted p-4">
                  <div className="text-sm text-slate-300">{label}</div>
                  <div className="mt-3 text-lg font-semibold text-slate-50">{ok ? '완료' : '미완료'}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="panel-muted p-4">총 에피소드: {evaluation.totalEpisodes}</div>
              <div className="panel-muted p-4">성공률: {Math.round(evaluation.successRate * 100)}%</div>
              <div className="panel-muted p-4">추천 액션: {evaluation.nextRecommendedAction}</div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
