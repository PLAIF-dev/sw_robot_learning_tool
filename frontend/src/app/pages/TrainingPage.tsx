import { useEffect, useMemo, useState } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { TRAINING_STAGES } from '../constants'
import { trainingApi } from '../api/training'
import type {
  CameraChannel,
  ClassifierStatus,
  DemoStatus,
  EvaluationSummary,
  MainTrainingStatus,
  RoiRectangle,
  TrainingEnvironment,
  TrainingStage,
} from '../types'
import { CameraPanel } from '../components/camera/CameraPanel'
import { RoiEditorCard } from '../components/camera/RoiEditorCard'
import { RobotViewer3D } from '../components/robot/RobotViewer3D'
import { useControlStore } from '../store/controlStore'
import { useKeyboardTcp } from '../hooks/useKeyboardTcp'
import { useDeviceStore } from '../store/deviceStore'

const DEFAULT_ROI_MAP: Record<CameraChannel, RoiRectangle> = {
  left: { channel: 'left', x: 0.16, y: 0.18, width: 0.28, height: 0.28 },
  right: { channel: 'right', x: 0.54, y: 0.2, width: 0.24, height: 0.26 },
  head: { channel: 'head', x: 0.3, y: 0.22, width: 0.34, height: 0.3 },
}

export function TrainingPage() {
  const leftJoints = useControlStore((state) => state.leftJoints)
  const rightJoints = useControlStore((state) => state.rightJoints)
  const selectedTarget = useControlStore((state) => state.target)
  const refreshControl = useControlStore((state) => state.refresh)
  const deviceStatus = useDeviceStore((state) => state.status)

  const [stage, setStage] = useState<TrainingStage>('Environment')
  const [environment, setEnvironment] = useState<TrainingEnvironment | null>(null)
  const [roiSettings, setRoiSettings] = useState<Record<CameraChannel, RoiRectangle>>(DEFAULT_ROI_MAP)
  const [classifier, setClassifier] = useState<ClassifierStatus | null>(null)
  const [demo, setDemo] = useState<DemoStatus | null>(null)
  const [mainTraining, setMainTraining] = useState<MainTrainingStatus | null>(null)
  const [evaluation, setEvaluation] = useState<EvaluationSummary | null>(null)

  useKeyboardTcp(true)

  async function refresh() {
    const [stageResponse, nextEnvironment, nextRoi, nextClassifier, nextDemo, nextMain, nextEvaluation] = await Promise.all([
      trainingApi.getCurrentStage(),
      trainingApi.getEnvironment(),
      trainingApi.getRoi(),
      trainingApi.getClassifier(),
      trainingApi.getDemo(),
      trainingApi.getMain(),
      trainingApi.getEvaluation(),
    ])

    setStage(stageResponse.stage)
    setEnvironment(nextEnvironment)
    setRoiSettings((previous) => mergeRoi(previous, nextRoi))
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
    await refresh()
  }

  async function handleSaveRoi(nextRoi: RoiRectangle) {
    const saved = await trainingApi.saveRoi(nextRoi.channel, {
      x: nextRoi.x,
      y: nextRoi.y,
      width: nextRoi.width,
      height: nextRoi.height,
    })

    setRoiSettings((previous) => ({
      ...previous,
      [saved.channel]: saved,
    }))
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
                <select
                  className="mt-3 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-slate-100"
                  value={environment.robotModel}
                  onChange={(event) => setEnvironment({ ...environment, robotModel: event.target.value as TrainingEnvironment['robotModel'] })}
                >
                  <option value="RB3 양팔로봇">RB3 양팔로봇</option>
                  <option value="RB5 양팔로봇">RB5 양팔로봇</option>
                </select>
              </label>

              <label className="panel-muted p-4">
                <div className="text-sm text-slate-300">제어 장치 설정</div>
                <select
                  className="mt-3 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-slate-100"
                  value={environment.controllerType}
                  onChange={(event) => setEnvironment({ ...environment, controllerType: event.target.value as TrainingEnvironment['controllerType'] })}
                >
                  <option value="3D Mouse">3D Mouse</option>
                  <option value="Master Arm">Master Arm</option>
                  <option value="UMI">UMI</option>
                </select>
              </label>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="panel-muted p-4">
                <div className="text-sm text-slate-300">Learning Rate</div>
                <input className="mt-3 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-slate-100" type="number" value={environment.learningRate} onChange={(e) => setEnvironment({ ...environment, learningRate: Number(e.target.value) })} />
              </label>
              <label className="panel-muted p-4">
                <div className="text-sm text-slate-300">Batch Size</div>
                <input className="mt-3 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-slate-100" type="number" value={environment.batchSize} onChange={(e) => setEnvironment({ ...environment, batchSize: Number(e.target.value) })} />
              </label>
              <label className="panel-muted p-4">
                <div className="text-sm text-slate-300">Max Episodes</div>
                <input className="mt-3 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-slate-100" type="number" value={environment.maxEpisodes} onChange={(e) => setEnvironment({ ...environment, maxEpisodes: Number(e.target.value) })} />
              </label>
            </div>
            <div className="mt-6 flex gap-3">
              <button className="rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white" onClick={() => void trainingApi.saveEnvironment(environment).then(refresh)}>
                저장
              </button>
              <button className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200" onClick={() => void changeStage('Roi')}>
                다음 단계
              </button>
            </div>
          </div>
        )}

        {stage === 'Roi' && (
          <div className="panel p-6">
            <div className="section-title">카메라 ROI 설정</div>
            <div className="mt-3 text-sm leading-6 text-slate-400">
              Left, Right, Head 카메라 이미지를 실시간으로 보면서 ROI 박스를 드래그해 위치를 조정할 수 있습니다. 드래그를 놓는 즉시 저장되며, 다시 열어도 백엔드 메모리 상태로 복원됩니다.
            </div>
            <div className="mt-6 grid gap-4 xl:grid-cols-3">
              <RoiEditorCard
                channel="left"
                roi={roiSettings.left}
                connected={deviceStatus?.leftCamera.connected ?? false}
                onSave={handleSaveRoi}
              />
              <RoiEditorCard
                channel="right"
                roi={roiSettings.right}
                connected={deviceStatus?.rightCamera.connected ?? false}
                onSave={handleSaveRoi}
              />
              <RoiEditorCard
                channel="head"
                roi={roiSettings.head}
                connected={deviceStatus?.headCamera.connected ?? false}
                onSave={handleSaveRoi}
              />
            </div>
            <div className="mt-6 flex gap-3">
              <button className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200" onClick={() => void changeStage('Environment')}>
                이전 단계
              </button>
              <button className="rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white" onClick={() => void changeStage('Classifier')}>
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
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {[
                { label: '환경 구성', ok: evaluation.environmentConfigured },
                { label: 'ROI 설정', ok: evaluation.roiConfigured },
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

function mergeRoi(
  previous: Record<CameraChannel, RoiRectangle>,
  next: RoiRectangle[],
): Record<CameraChannel, RoiRectangle> {
  const merged = { ...previous }
  for (const item of next) {
    merged[item.channel] = item
  }
  return merged
}
