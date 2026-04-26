import { useEffect, useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { checkpointsApi } from '../api/checkpoints'
import { trainingApi } from '../api/training'
import { TRAINING_STAGES } from '../constants'
import { CameraPanel } from '../components/camera/CameraPanel'
import { CameraView } from '../components/camera/CameraView'
import { RoiEditorCard } from '../components/camera/RoiEditorCard'
import { RobotViewer3D } from '../components/robot/RobotViewer3D'
import { useKeyboardTcp } from '../hooks/useKeyboardTcp'
import { useControlStore } from '../store/controlStore'
import { useDeviceStore } from '../store/deviceStore'
import type {
  CameraChannel,
  Checkpoint,
  ClassifierStatus,
  DeviceStatus,
  DemoRecord,
  DemoStatus,
  EvaluationSummary,
  MainTrainingStatus,
  RoiRectangle,
  TcpPose,
  TrainingEnvironment,
  TrainingStage,
} from '../types'

const DEFAULT_ROI_MAP: Record<CameraChannel, RoiRectangle> = {
  left: { channel: 'left', x: 0.16, y: 0.18, width: 0.28, height: 0.28 },
  right: { channel: 'right', x: 0.54, y: 0.2, width: 0.24, height: 0.26 },
  head: { channel: 'head', x: 0.3, y: 0.22, width: 0.34, height: 0.3 },
}

const ROBOT_OPTIONS = ['RB3 듀얼암 로봇', 'RB5 듀얼암 로봇']
const CONTROLLER_OPTIONS = ['3D Mouse', 'Master Arm', 'UMI']
const DECISION_SOURCE_LABELS = {
  environment: '환경 값',
  classifier: '기준 모델',
  human: '사용자 보정',
} as const

const COMPARISON_CLIPS = [
  { id: 'cmp-a', name: '클립 A', summary: '왼팔 접근이 안정적이고 종료 위치가 일정합니다.' },
  { id: 'cmp-b', name: '클립 B', summary: '속도는 빠르지만 종료 구간 흔들림이 있습니다.' },
]

const REPLAY_SEGMENTS = [
  { label: '접근', width: '28%' },
  { label: '집기', width: '18%' },
  { label: '이동', width: '34%' },
  { label: '배치', width: '20%' },
]

type DemoBrowserTab = 'collect' | 'browser'
type DecisionSource = keyof typeof DECISION_SOURCE_LABELS

export function TrainingPage() {
  const leftTcpPose = useControlStore((state) => state.leftTcpPose)
  const rightTcpPose = useControlStore((state) => state.rightTcpPose)
  const leftJoints = useControlStore((state) => state.leftJoints)
  const rightJoints = useControlStore((state) => state.rightJoints)
  const selectedTarget = useControlStore((state) => state.target)
  const refreshControl = useControlStore((state) => state.refresh)
  const deviceStatus = useDeviceStore((state) => state.status)

  const [stage, setStage] = useState<TrainingStage>('Environment')
  const [environment, setEnvironment] = useState<TrainingEnvironment>({
    robotModel: 'RB3 듀얼암 로봇',
    controllerType: '3D Mouse',
    learningRate: 0.001,
    batchSize: 32,
    maxEpisodes: 100,
  })
  const [roiSettings, setRoiSettings] = useState<Record<CameraChannel, RoiRectangle>>(DEFAULT_ROI_MAP)
  const [classifier, setClassifier] = useState<ClassifierStatus | null>(null)
  const [demo, setDemo] = useState<DemoStatus | null>(null)
  const [mainTraining, setMainTraining] = useState<MainTrainingStatus | null>(null)
  const [evaluation, setEvaluation] = useState<EvaluationSummary | null>(null)
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([])

  const [rewardRecording, setRewardRecording] = useState(false)
  const [comparisonDrawerOpen, setComparisonDrawerOpen] = useState(false)
  const [comparisonLabelCount, setComparisonLabelCount] = useState(12)
  const [classifierVersion, setClassifierVersion] = useState(2)
  const [lastClassifierBuiltAt, setLastClassifierBuiltAt] = useState<string | null>(null)

  const [demoTab, setDemoTab] = useState<DemoBrowserTab>('collect')
  const [selectedDemoIds, setSelectedDemoIds] = useState<string[]>([])
  const [initialModelVersion, setInitialModelVersion] = useState(1)
  const [initialModelReady, setInitialModelReady] = useState(false)

  const [decisionSource, setDecisionSource] = useState<DecisionSource>('environment')
  const [manualControlActive, setManualControlActive] = useState(false)
  const [interventionCount, setInterventionCount] = useState(3)
  const [savedCorrections, setSavedCorrections] = useState(2)
  const [operationMessage, setOperationMessage] = useState('자동 실행을 시작하면 현재 상태가 여기에 표시됩니다.')

  const [selectedCheckpointId, setSelectedCheckpointId] = useState<string>('')
  const [finalModelId, setFinalModelId] = useState<string | null>(null)
  const [replayChannel, setReplayChannel] = useState<CameraChannel>('head')

  useKeyboardTcp(stage === 'Classifier' || stage === 'Demo' || stage === 'MainTraining')

  async function refresh() {
    const [stageResponse, nextEnvironment, nextRoi, nextClassifier, nextDemo, nextMain, nextEvaluation, nextCheckpoints] = await Promise.all([
      trainingApi.getCurrentStage(),
      trainingApi.getEnvironment(),
      trainingApi.getRoi(),
      trainingApi.getClassifier(),
      trainingApi.getDemo(),
      trainingApi.getMain(),
      trainingApi.getEvaluation(),
      checkpointsApi.getAll(),
    ])

    setStage(stageResponse.stage)
    setEnvironment(nextEnvironment)
    setRoiSettings((previous) => mergeRoi(previous, nextRoi))
    setClassifier(nextClassifier)
    setDemo(nextDemo)
    setMainTraining(nextMain)
    setEvaluation(nextEvaluation)
    setCheckpoints(nextCheckpoints)
    await refreshControl()
  }

  useEffect(() => {
    void refresh()
  }, [])

  const demoRows = useMemo(() => buildDemoRows(demo), [demo])
  const chartData = useMemo(() => buildChartData(mainTraining), [mainTraining])
  const recommendedCheckpoint = useMemo(() => pickRecommendedCheckpoint(checkpoints), [checkpoints])
  const selectedCheckpoint = useMemo(
    () => checkpoints.find((item) => item.id === selectedCheckpointId) ?? recommendedCheckpoint ?? null,
    [checkpoints, recommendedCheckpoint, selectedCheckpointId],
  )

  useEffect(() => {
    if (recommendedCheckpoint && !selectedCheckpointId) {
      setSelectedCheckpointId(recommendedCheckpoint.id)
    }
  }, [recommendedCheckpoint, selectedCheckpointId])

  useEffect(() => {
    if (demoRows.length === 0 || selectedDemoIds.length > 0) {
      return
    }

    const defaults = demoRows.filter((item) => item.markedSuccess !== false).slice(0, 2).map((item) => item.id)
    if (defaults.length > 0) {
      setSelectedDemoIds(defaults)
    }
  }, [demoRows, selectedDemoIds.length])

  const classifierSampleCount = (classifier?.successCount ?? 0) + (classifier?.failureCount ?? 0) + (classifier?.outOfRangeCount ?? 0)
  const classifierReady = Boolean(classifier?.canProceed && comparisonLabelCount >= 6)
  const selectedDemoCount = selectedDemoIds.length
  const activeRunLabel = !mainTraining
    ? '준비 중'
    : mainTraining.isRunning
      ? manualControlActive
        ? '사용자 직접 조작 중'
        : '자동 실행 중'
      : '대기 중'

  const operationLog = buildOperationLog(mainTraining, interventionCount, savedCorrections, decisionSource)
  const readinessCards = [
    { label: '기본 설정', ok: evaluation?.environmentConfigured ?? Boolean(environment) },
    { label: 'ROI 설정', ok: evaluation?.roiConfigured ?? false },
    { label: '판단 기준', ok: evaluation?.classifierTrained ?? classifierReady },
    { label: '초기 모델', ok: evaluation?.demoCollected ?? initialModelReady },
    { label: '자동 학습', ok: evaluation?.trainingCompleted ?? Boolean(mainTraining?.totalEpisodes) },
  ]

  async function changeStage(nextStage: TrainingStage) {
    setStage(nextStage)
    await trainingApi.setCurrentStage(nextStage)
    await refresh()
  }

  async function handleSaveEnvironment() {
    await trainingApi.saveEnvironment(environment)
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

  async function handleCollectClassifier(label: 'success' | 'failure' | 'out_of_range') {
    await trainingApi.collectClassifier(label)
    setRewardRecording(false)
    await refresh()
  }

  function handleComparisonChoice(preferredClipId: string) {
    setComparisonLabelCount((current) => current + 1)
    setComparisonDrawerOpen(false)
    setOperationMessage(`${preferredClipId === 'cmp-a' ? '클립 A' : '클립 B'}가 더 나은 구간으로 저장되었습니다.`)
  }

  function handleBuildClassifier() {
    if (!classifierReady) {
      return
    }

    setClassifierVersion((current) => current + 1)
    setLastClassifierBuiltAt(new Date().toISOString())
    setDecisionSource('classifier')
    setOperationMessage('새 판단 기준 모델이 준비되었습니다.')
  }

  async function handleStartDemoCapture() {
    await trainingApi.startDemo()
    setDemoTab('collect')
    await refresh()
  }

  async function handleMarkDemoSuccess() {
    await trainingApi.markDemoSuccess()
    await refresh()
  }

  async function handleEndDemoCapture() {
    await trainingApi.endDemo()
    await refresh()
  }

  function toggleDemoSelection(id: string) {
    setSelectedDemoIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  function handlePrepareInitialModel() {
    if (selectedDemoCount === 0) {
      return
    }

    setInitialModelReady(true)
    setInitialModelVersion((current) => current + 1)
    setOperationMessage(`선택한 ${selectedDemoCount}개의 시연으로 초기 모델을 준비했습니다.`)
  }

  function handleResetInitialModel() {
    setInitialModelReady(false)
    setOperationMessage('초기 모델 상태를 다시 시작했습니다.')
  }

  async function handleStartAutoLearning() {
    await trainingApi.startMain()
    setManualControlActive(false)
    setDecisionSource(classifierReady ? 'classifier' : 'environment')
    setOperationMessage('자동 실행이 시작되었습니다.')
    await refresh()
  }

  async function handleStopAutoLearning() {
    await trainingApi.stopMain()
    setManualControlActive(false)
    setOperationMessage('자동 실행이 중지되었습니다.')
    await refresh()
  }

  function handleIntervene() {
    setInterventionCount((current) => current + 1)
    setManualControlActive(true)
    setDecisionSource('human')
    setOperationMessage('사용자가 현재 실행에 개입했습니다.')
  }

  function handleTakeOver() {
    setManualControlActive(true)
    setDecisionSource('human')
    setOperationMessage('직접 조작 모드로 전환되었습니다.')
  }

  function handleSaveCorrection() {
    setSavedCorrections((current) => current + 1)
    setManualControlActive(false)
    setDecisionSource('human')
    setOperationMessage('개입 내용을 보정 데이터로 저장했습니다.')
  }

  function handleSelectFinalModel() {
    if (!selectedCheckpoint) {
      return
    }

    setFinalModelId(selectedCheckpoint.id)
    setOperationMessage(`${selectedCheckpoint.name}을(를) 최종 모델로 선택했습니다.`)
  }

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
        <aside className="panel p-4">
          <div className="section-title">학습 실행 단계</div>
          <div className="mt-4 space-y-2">
            {TRAINING_STAGES.map((item, index) => (
              <button
                key={item.key}
                className={`stage-button w-full ${stage === item.key ? 'stage-button-active' : 'stage-button-inactive'}`}
                onClick={() => void changeStage(item.key)}
              >
                <div>
                  <div className="text-xs text-slate-400">STEP {index + 1}</div>
                  <div className="mt-1 font-medium">{item.label}</div>
                  <div className="mt-1 text-xs text-slate-400">{item.hint}</div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="space-y-6">
          {stage === 'Environment' && (
            <div className="space-y-6">
              <section className="panel p-6">
                <div className="section-title">기본 설정</div>
                <h1 className="mt-3 text-3xl font-semibold text-slate-50">작업 시작 전에 장비와 기본 학습값을 확인합니다.</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                  로봇 모델, 제어장치, 실행 기본값을 설정하는 단계입니다. 현재 작업에 맞는 조건을 확인한 뒤 다음 단계로 진행합니다.
                </p>
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="hidden">
                  <div className="section-title">장비 선택</div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <label className="panel-muted p-4">
                      <div className="text-sm text-slate-300">로봇 모델</div>
                      <select
                        className="mt-3 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-slate-100"
                        value={environment.robotModel}
                        onChange={(event) => setEnvironment({ ...environment, robotModel: event.target.value })}
                      >
                        {ROBOT_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="panel-muted p-4">
                      <div className="text-sm text-slate-300">제어장치</div>
                      <select
                        className="mt-3 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-slate-100"
                        value={environment.controllerType}
                        onChange={(event) => setEnvironment({ ...environment, controllerType: event.target.value })}
                      >
                        {CONTROLLER_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <label className="panel-muted p-4">
                      <div className="text-sm text-slate-300">학습 속도</div>
                      <input
                        className="mt-3 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-slate-100"
                        type="number"
                        step="0.0001"
                        value={environment.learningRate}
                        onChange={(event) => setEnvironment({ ...environment, learningRate: Number(event.target.value) })}
                      />
                    </label>
                    <label className="panel-muted p-4">
                      <div className="text-sm text-slate-300">한 번에 보는 데이터 수</div>
                      <input
                        className="mt-3 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-slate-100"
                        type="number"
                        value={environment.batchSize}
                        onChange={(event) => setEnvironment({ ...environment, batchSize: Number(event.target.value) })}
                      />
                    </label>
                    <label className="panel-muted p-4">
                      <div className="text-sm text-slate-300">최대 반복 수</div>
                      <input
                        className="mt-3 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-slate-100"
                        type="number"
                        value={environment.maxEpisodes}
                        onChange={(event) => setEnvironment({ ...environment, maxEpisodes: Number(event.target.value) })}
                      />
                    </label>
                  </div>
                </div>

                <div className="hidden">
                  <div className="section-title">진행 전 확인</div>
                  <div className="mt-4 space-y-3">
                    <StatusRow label="왼팔 연결" value={deviceStatus?.leftArm.connected ? '정상' : '확인 필요'} tone={deviceStatus?.leftArm.connected ? 'good' : 'neutral'} />
                    <StatusRow label="오른팔 연결" value={deviceStatus?.rightArm.connected ? '정상' : '확인 필요'} tone={deviceStatus?.rightArm.connected ? 'good' : 'neutral'} />
                    <StatusRow label="제어장치 연결" value={deviceStatus?.controller.connected ? '정상' : '확인 필요'} tone={deviceStatus?.controller.connected ? 'good' : 'neutral'} />
                    <StatusRow
                      label="카메라 연결 수"
                      value={`${Number(deviceStatus?.leftCamera.connected ?? false) + Number(deviceStatus?.rightCamera.connected ?? false) + Number(deviceStatus?.headCamera.connected ?? false)} / 3`}
                      tone="neutral"
                    />
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button className="rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white" onClick={() => void handleSaveEnvironment()}>
                      설정 저장
                    </button>
                    <button className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200" onClick={() => void changeStage('Roi')}>
                      다음 단계
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {stage === 'Roi' && (
            <div className="space-y-6">
              <section className="panel p-6">
                <div className="section-title">카메라 ROI 설정</div>
                <h1 className="mt-3 text-3xl font-semibold text-slate-50">세 카메라 화면을 크게 보고 작업 영역을 맞춥니다.</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                  왼쪽, 오른쪽, 헤드 카메라별 작업 영역을 설정합니다. 각 화면에서 로봇 끝단과 작업 대상이 안정적으로 포함되도록 영역을 조정합니다.
                </p>
              </section>

              <section className="panel p-6">
                <div className="section-title">3채널 카메라</div>
                <div className="mt-4 grid gap-4 xl:grid-cols-3">
                  <RoiEditorCard channel="left" roi={roiSettings.left} connected={deviceStatus?.leftCamera.connected ?? false} onSave={handleSaveRoi} />
                  <RoiEditorCard channel="right" roi={roiSettings.right} connected={deviceStatus?.rightCamera.connected ?? false} onSave={handleSaveRoi} />
                  <RoiEditorCard channel="head" roi={roiSettings.head} connected={deviceStatus?.headCamera.connected ?? false} onSave={handleSaveRoi} />
                </div>
              </section>

              <section className="panel p-6">
                <div className="grid gap-6 xl:grid-cols-[1fr_auto] xl:items-end">
                  <div>
                  <div className="section-title">맞춤 기준</div>
                  <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                    <div className="panel-muted p-4">작업 시작 지점과 종료 지점이 모두 ROI 안에 들어오도록 맞춥니다.</div>
                    <div className="panel-muted p-4">팔 끝이 화면 가장자리에서 잘리지 않게 약간 여유를 둡니다.</div>
                    <div className="panel-muted p-4">세 카메라 모두 비슷한 작업 구간을 포함하면 이후 라벨링이 쉬워집니다.</div>
                  </div>
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
              </section>
            </div>
          )}

          {stage === 'Classifier' && classifier && (
            <div className="space-y-6">
              <section className="panel p-6">
                <div className="section-title">판단 기준 데이터 준비</div>
                <h1 className="mt-3 text-3xl font-semibold text-slate-50">성공과 실패를 구분할 기준 데이터를 모읍니다.</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                  성공, 실패, 비교 라벨을 수집해 작업 품질을 구분하는 기준을 준비합니다. 세 카메라 화면을 동시에 확인하며 데이터를 기록할 수 있습니다.
                </p>
              </section>

              <section className="panel p-6">
                <div className="section-title">3D 로봇 뷰어</div>
                <div className="mt-4 h-72">
                  <RobotViewer3D leftJoints={leftJoints} rightJoints={rightJoints} selectedTarget={selectedTarget} />
                </div>
              </section>

              <section className="panel p-6">
                <div className="section-title">3채널 카메라</div>
                <div className="mt-4">
                  <CameraPanel layout="triple" roiMap={roiSettings} compact />
                </div>
              </section>

              <section className="grid gap-6 xl:grid-cols-2">
                <TcpPoseDisplay label="왼팔 TCP" pose={leftTcpPose} />
                <TcpPoseDisplay label="오른팔 TCP" pose={rightTcpPose} />
              </section>

              <section className="grid gap-6 xl:grid-cols-[1fr_340px]">
                <div className="space-y-6">
                  <div className="panel p-6">
                    <div className="section-title">시연 녹화와 태깅</div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        className={`rounded-2xl px-4 py-3 text-sm font-semibold text-white ${rewardRecording ? 'bg-white/10 text-slate-200' : 'bg-sky-500'}`}
                        onClick={() => setRewardRecording(true)}
                      >
                        시연 녹화 시작
                      </button>
                      <button className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200" onClick={() => setRewardRecording(false)}>
                        녹화 종료
                      </button>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <button className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white" onClick={() => void handleCollectClassifier('success')}>
                        성공으로 태깅
                      </button>
                      <button className="rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white" onClick={() => void handleCollectClassifier('failure')}>
                        실패로 태깅
                      </button>
                      <button className="rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white" onClick={() => void handleCollectClassifier('out_of_range')}>
                        작업 구간 아님
                      </button>
                    </div>
                    <div className="mt-4 panel-muted p-4 text-sm text-slate-300">
                      현재 상태: {rewardRecording ? '녹화 중' : '대기 중'}
                    </div>
                  </div>

                  <div className="panel p-6">
                    <div className="section-title">구간 비교 라벨링</div>
                    <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
                      <div className="panel-muted p-4 text-sm leading-6 text-slate-300">
                        두 구간을 비교해 더 안정적인 작업 장면을 선택합니다. 같은 화면에서 연속으로 라벨링할 수 있어 판단 기준 정리가 빠릅니다.
                      </div>
                      <button className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-slate-50" onClick={() => setComparisonDrawerOpen(true)}>
                        비교 화면 열기
                      </button>
                    </div>
                  </div>
                </div>

                <div className="panel p-6">
                  <div className="section-title">수집 현황</div>
                  <div className="mt-4 grid gap-3">
                    <MetricCard label="전체 샘플 수" value={`${classifierSampleCount}`} note={`최소 권장 ${classifier.minRequired}개`} />
                    <MetricCard label="성공 / 실패" value={`${classifier.successCount} / ${classifier.failureCount}`} note="실패 예시도 충분히 있어야 합니다." />
                    <MetricCard label="구간 비교 라벨" value={`${comparisonLabelCount}`} note="라벨이 늘수록 기준 품질이 좋아집니다." />
                  </div>

                  <div className="mt-6 panel-muted p-4">
                    <div className="text-sm text-slate-300">판단 기준 모델 버전</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-50">v{classifierVersion}</div>
                    <div className="mt-2 text-xs text-slate-400">
                      {lastClassifierBuiltAt ? `최근 생성 ${formatDateTime(lastClassifierBuiltAt)}` : '아직 새 버전이 생성되지 않았습니다.'}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      className={`rounded-2xl px-4 py-3 text-sm font-semibold text-white ${classifierReady ? 'bg-sky-500' : 'bg-slate-700 text-slate-300'}`}
                      disabled={!classifierReady}
                      onClick={handleBuildClassifier}
                    >
                      판단 기준 모델 만들기
                    </button>
                    <button className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200" onClick={() => void trainingApi.resetClassifier().then(refresh)}>
                      데이터 초기화
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {stage === 'Demo' && demo && (
            <div className="space-y-6">
              <section className="panel p-6">
                <div className="section-title">초기 작업 데이터 준비</div>
                <h1 className="mt-3 text-3xl font-semibold text-slate-50">초기 시연을 모으고 좋은 기록만 골라 시작 모델을 준비합니다.</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                  초기 시연을 수집한 뒤 기록 목록에서 사용할 데이터를 선별합니다. 선별된 시연은 시작 모델 준비에 바로 반영할 수 있습니다.
                </p>
              </section>

              <section className="panel p-6">
                <div className="section-title">3D 로봇 뷰어</div>
                <div className="mt-4 h-72">
                  <RobotViewer3D leftJoints={leftJoints} rightJoints={rightJoints} selectedTarget={selectedTarget} />
                </div>
              </section>

              <section className="panel p-6">
                <div className="section-title">3채널 카메라</div>
                <div className="mt-4">
                  <CameraPanel layout="triple" roiMap={roiSettings} compact />
                </div>
              </section>

              <section className="grid gap-6 xl:grid-cols-2">
                <TcpPoseDisplay label="왼팔 TCP" pose={leftTcpPose} />
                <TcpPoseDisplay label="오른팔 TCP" pose={rightTcpPose} />
              </section>

              <section className="panel p-6">
                <div className="flex flex-wrap gap-2">
                  {[
                    ['collect', '수집하기'],
                    ['browser', '기록 보기'],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      className={`rounded-2xl px-4 py-2 text-sm ${demoTab === key ? 'bg-sky-500 text-white' : 'bg-white/5 text-slate-300'}`}
                      onClick={() => setDemoTab(key as DemoBrowserTab)}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {demoTab === 'collect' ? (
                  <div className="mt-6 space-y-4">
                    <div className="flex flex-wrap gap-3">
                      <button className="rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white" onClick={() => void handleStartDemoCapture()}>
                        초기 시연 시작
                      </button>
                      <button className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white" onClick={() => void handleMarkDemoSuccess()}>
                        좋은 시연으로 표시
                      </button>
                      <button className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200" onClick={() => void handleEndDemoCapture()}>
                        시연 종료
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <MetricCard label="현재 상태" value={demo.isRecording ? '녹화 중' : '대기 중'} note="수집 중에는 카메라와 3D 뷰를 함께 확인합니다." />
                      <MetricCard label="누적 시연 수" value={`${demo.demoCount}`} note={`최소 권장 ${demo.minRequired}개`} />
                      <MetricCard label="선택된 좋은 시연" value={`${selectedDemoCount}`} note="기록 보기 탭에서 선택합니다." />
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
                    <div className="space-y-3">
                      {demoRows.map((item) => (
                        <button
                          key={item.id}
                          className={`panel-muted flex w-full items-center justify-between gap-4 p-4 text-left ${selectedDemoIds.includes(item.id) ? 'ring-1 ring-sky-400/60' : ''}`}
                          onClick={() => toggleDemoSelection(item.id)}
                        >
                          <div>
                            <div className="font-semibold text-slate-100">{item.id}</div>
                            <div className="mt-1 text-sm text-slate-400">
                              {item.resultLabel} · {item.durationLabel} · {formatDateTime(item.startedAt)}
                            </div>
                          </div>
                          <div className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">
                            {selectedDemoIds.includes(item.id) ? '선택됨' : '선택'}
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="panel-muted p-4">
                        <div className="text-sm text-slate-300">초기 모델 상태</div>
                        <div className="mt-2 text-2xl font-semibold text-slate-50">{initialModelReady ? `준비됨 v${initialModelVersion}` : '아직 준비 전'}</div>
                        <div className="mt-2 text-xs text-slate-400">선별한 시연만 반영해 시작 모델 품질을 안정적으로 관리합니다.</div>
                      </div>
                      <button
                        className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white ${selectedDemoCount > 0 ? 'bg-sky-500' : 'bg-slate-700 text-slate-300'}`}
                        disabled={selectedDemoCount === 0}
                        onClick={handlePrepareInitialModel}
                      >
                        선택한 시연으로 초기 모델 준비
                      </button>
                      <button className="w-full rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200" onClick={handleResetInitialModel}>
                        초기 상태 다시 시작
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}

          {stage === 'MainTraining' && mainTraining && (
            <div className="space-y-6">
              <section className="panel p-6">
                <div className="section-title">자동 학습 실행</div>
                <h1 className="mt-3 text-3xl font-semibold text-slate-50">자동 실행 상태와 사용자 개입 기록을 한 화면에서 운영합니다.</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                  자동 실행 현황, 현재 판단 기준, 수동 개입 이력을 한 화면에서 확인합니다. 운영 중 필요한 제어와 기록 저장을 바로 수행할 수 있습니다.
                </p>
              </section>

              <section className="panel p-6">
                <div className="section-title">3D 로봇 뷰어</div>
                <div className="mt-4 h-72">
                  <RobotViewer3D leftJoints={leftJoints} rightJoints={rightJoints} selectedTarget={selectedTarget} />
                </div>
              </section>

              <section className="panel p-6">
                <div className="section-title">3채널 카메라</div>
                <div className="mt-4">
                  <CameraPanel layout="triple" roiMap={roiSettings} compact />
                </div>
              </section>

              <section className="grid gap-6 xl:grid-cols-2">
                <TcpPoseDisplay label="왼팔 TCP" pose={leftTcpPose} />
                <TcpPoseDisplay label="오른팔 TCP" pose={rightTcpPose} />
              </section>

              <div className="space-y-6">
                  <div className="panel p-6">
                    <div className="section-title">운영 콘솔</div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button className="rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white" onClick={() => void handleStartAutoLearning()}>
                        자동 실행 시작
                      </button>
                      <button className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200" onClick={() => void handleStopAutoLearning()}>
                        자동 실행 중지
                      </button>
                      <button className="rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white" onClick={handleIntervene}>
                        수동 개입
                      </button>
                      <button className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-slate-50" onClick={handleTakeOver}>
                        직접 조작
                      </button>
                      <button className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white" onClick={handleSaveCorrection}>
                        개입 내용 저장
                      </button>
                    </div>
                    <div className="mt-4 panel-muted p-4 text-sm text-slate-300">{operationMessage}</div>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
                    <div className="space-y-6">
                      <div className="panel p-6">
                        <div className="section-title">최근 실행 추이</div>
                        <div className="mt-4 h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                              <defs>
                                <linearGradient id="duration-fill" x1="0" x2="0" y1="0" y2="1">
                                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                              <Tooltip />
                              <Area type="monotone" dataKey="duration" stroke="#38bdf8" fill="url(#duration-fill)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="panel p-6">
                        <div className="section-title">개입 및 실행 로그</div>
                        <div className="mt-4 space-y-3">
                          {operationLog.map((item) => (
                            <div key={item.title} className="panel-muted flex items-start justify-between gap-4 p-4">
                              <div>
                                <div className="font-semibold text-slate-100">{item.title}</div>
                                <div className="mt-1 text-sm text-slate-400">{item.detail}</div>
                              </div>
                              <div className="text-xs text-slate-500">{item.timestamp}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <MetricCard label="현재 상태" value={activeRunLabel} note="자동 실행과 직접 조작 상태를 함께 반영합니다." />
                      <MetricCard label="현재 판단 기준" value={DECISION_SOURCE_LABELS[decisionSource]} note="환경 값, 기준 모델, 사용자 보정 중 하나를 사용합니다." />
                      <MetricCard label="누적 실행 수" value={`${mainTraining.totalEpisodes}`} note="내부 step 대신 이해하기 쉬운 실행 수로 표시했습니다." />
                      <MetricCard label="성공 비율" value={`${Math.round(mainTraining.successRate * 100)}%`} note={`${mainTraining.successCount}회 성공`} />
                      <MetricCard label="수동 개입 횟수" value={`${interventionCount}`} note={`저장한 보정 ${savedCorrections}건`} />
                    </div>
                  </div>
                </div>
            </div>
          )}

          {stage === 'Evaluation' && (
            <div className="space-y-6">
              <section className="panel p-6">
                <div className="section-title">결과 검토 및 배포</div>
                <h1 className="mt-3 text-3xl font-semibold text-slate-50">저장된 모델을 비교하고 최종 모델을 선택합니다.</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                  저장된 모델의 성능과 실행 결과를 비교해 운영에 적용할 모델을 선택합니다. 선택한 모델의 replay와 주요 지표를 함께 검토할 수 있습니다.
                </p>
              </section>

              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {readinessCards.map((item) => (
                  <div key={item.label} className="panel-muted p-4">
                    <div className="text-sm text-slate-300">{item.label}</div>
                    <div className="mt-3 text-lg font-semibold text-slate-50">{item.ok ? '준비됨' : '확인 필요'}</div>
                  </div>
                ))}
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="panel p-6">
                  <div className="section-title">모델 비교</div>
                  <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
                    <table className="min-w-full divide-y divide-white/10 text-left text-sm text-slate-200">
                      <thead className="bg-white/5 text-slate-400">
                        <tr>
                          <th className="px-4 py-3 font-medium">모델</th>
                          <th className="px-4 py-3 font-medium">성공 비율</th>
                          <th className="px-4 py-3 font-medium">평균 시간</th>
                          <th className="px-4 py-3 font-medium">누적 실행</th>
                          <th className="px-4 py-3 font-medium">상태</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {checkpoints.map((checkpoint) => (
                          <tr
                            key={checkpoint.id}
                            className={`cursor-pointer transition hover:bg-white/5 ${selectedCheckpoint?.id === checkpoint.id ? 'bg-sky-500/10' : ''}`}
                            onClick={() => setSelectedCheckpointId(checkpoint.id)}
                          >
                            <td className="px-4 py-3">{checkpoint.name}</td>
                            <td className="px-4 py-3">{Math.round(checkpoint.successRate * 100)}%</td>
                            <td className="px-4 py-3">{checkpoint.averageDuration.toFixed(1)}초</td>
                            <td className="px-4 py-3">{checkpoint.totalEpisodes}</td>
                            <td className="px-4 py-3">
                              {recommendedCheckpoint?.id === checkpoint.id ? (
                                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-200">추천</span>
                              ) : finalModelId === checkpoint.id ? (
                                <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs text-sky-100">선택됨</span>
                              ) : (
                                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">비교 중</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 text-sm text-slate-400">{evaluation?.nextRecommendedAction ?? '성공 비율과 평균 시간을 함께 보고 최종 모델을 선택하세요.'}</div>
                </div>

                <div className="space-y-6">
                  <div className="panel p-6">
                    <div className="section-title">선택한 모델</div>
                    {selectedCheckpoint ? (
                      <>
                        <div className="mt-4 panel-muted p-4">
                          <div className="text-lg font-semibold text-slate-100">{selectedCheckpoint.name}</div>
                          <div className="mt-2 text-sm text-slate-400">{formatDateTime(selectedCheckpoint.createdAt)}</div>
                          <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-1">
                            <MetricCard label="성공 비율" value={`${Math.round(selectedCheckpoint.successRate * 100)}%`} note="최근 평가 기준" compact />
                            <MetricCard label="평균 시간" value={`${selectedCheckpoint.averageDuration.toFixed(1)}초`} note="짧을수록 빠릅니다." compact />
                            <MetricCard label="누적 실행" value={`${selectedCheckpoint.totalEpisodes}`} note="검증에 사용한 실행 수" compact />
                          </div>
                        </div>
                        <button className="mt-4 w-full rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white" onClick={handleSelectFinalModel}>
                          최종 모델 선택
                        </button>
                      </>
                    ) : (
                      <div className="mt-4 text-sm text-slate-400">비교할 모델을 먼저 선택하세요.</div>
                    )}
                  </div>

                  <div className="panel p-6">
                    <div className="section-title">실행 기록 다시 보기</div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {([
                        ['left', '왼쪽 카메라'],
                        ['right', '오른쪽 카메라'],
                        ['head', '헤드 카메라'],
                      ] as Array<[CameraChannel, string]>).map(([channel, label]) => (
                        <button
                          key={channel}
                          className={`rounded-full px-3 py-1 text-xs ${replayChannel === channel ? 'bg-sky-500 text-white' : 'bg-white/10 text-slate-300'}`}
                          onClick={() => setReplayChannel(channel)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 panel-muted overflow-hidden p-5">
                      <div className="text-sm text-slate-300">{selectedCheckpoint?.name ?? '선택한 모델 없음'}</div>
                      <div className="mt-2 text-2xl font-semibold text-slate-50">{replayChannel === 'head' ? '상단 시점 재생' : replayChannel === 'left' ? '왼쪽 시점 재생' : '오른쪽 시점 재생'}</div>
                      <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-slate-950/60 p-5 text-sm text-slate-300">
                        선택한 모델의 실행 기록 요약 영역입니다. 시점별 replay와 구간 진행 정보를 함께 확인할 수 있습니다.
                      </div>
                      <div className="mt-4 flex gap-2">
                        {REPLAY_SEGMENTS.map((segment) => (
                          <div key={segment.label} className="rounded-full bg-sky-500/20 px-3 py-2 text-xs text-sky-100" style={{ width: segment.width }}>
                            {segment.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </section>
      </div>

      {comparisonDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-6">
          <div className="panel max-w-5xl p-6">
            <div className="section-title">구간 비교 라벨링</div>
            <h2 className="mt-3 text-2xl font-semibold text-slate-50">어느 쪽이 더 좋은 구간인지 선택하세요.</h2>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {COMPARISON_CLIPS.map((clip) => (
                <div key={clip.id} className="panel-muted p-5">
                  <div className="text-lg font-semibold text-slate-100">{clip.name}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-400">{clip.summary}</div>
                  <div className="mt-4 grid gap-2 md:grid-cols-3">
                    <div className="rounded-xl bg-slate-950/70 px-3 py-4 text-center text-xs text-slate-300">왼쪽 카메라</div>
                    <div className="rounded-xl bg-slate-950/70 px-3 py-4 text-center text-xs text-slate-300">오른쪽 카메라</div>
                    <div className="rounded-xl bg-slate-950/70 px-3 py-4 text-center text-xs text-slate-300">헤드 카메라</div>
                  </div>
                  <button className="mt-4 w-full rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white" onClick={() => handleComparisonChoice(clip.id)}>
                    이 구간이 더 좋음
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200" onClick={() => setComparisonDrawerOpen(false)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function MetricCard({
  label,
  value,
  note,
  compact = false,
}: {
  label: string
  value: string
  note: string
  compact?: boolean
}) {
  return (
    <div className="panel-muted p-4">
      <div className="text-sm text-slate-300">{label}</div>
      <div className={`${compact ? 'mt-2 text-xl' : 'mt-3 text-2xl'} font-semibold text-slate-50`}>{value}</div>
      <div className="mt-2 text-xs leading-5 text-slate-400">{note}</div>
    </div>
  )
}

function StatusRow({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'good' | 'neutral'
}) {
  return (
    <div className="panel-muted flex items-center justify-between p-4">
      <span className="text-sm text-slate-300">{label}</span>
      <span className={`rounded-full px-3 py-1 text-xs ${tone === 'good' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white/10 text-slate-300'}`}>
        {value}
      </span>
    </div>
  )
}

function TcpPoseDisplay({ label, pose }: { label: string; pose: TcpPose | null }) {
  return (
    <div className="panel p-6">
      <div className="section-title">{label}</div>
      {pose ? (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {Object.entries(pose).map(([key, value]) => (
            <div key={key} className="panel-muted p-2">
              <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{key}</div>
              <div className="mt-1 text-sm font-medium text-slate-100">{value.toFixed(3)}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 text-sm text-slate-400">연결 대기 중</div>
      )}
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

function buildDemoRows(demo: DemoStatus | null) {
  const records = demo?.demos ?? []
  if (records.length > 0) {
    return records.map((record, index) => toDemoRow(record, index))
  }

  const total = demo?.demoCount ?? 0
  return Array.from({ length: total }, (_, index) => {
    const startedAt = new Date(Date.now() - (index + 1) * 1000 * 60 * 18).toISOString()
    return toDemoRow(
      {
        id: `demo-${String(index + 1).padStart(3, '0')}`,
        taskId: 'task-001',
        startedAt,
        endedAt: new Date(Date.parse(startedAt) + (120 + index * 18) * 1000).toISOString(),
        markedSuccess: index % 3 !== 1,
      },
      index,
    )
  })
}

function toDemoRow(record: DemoRecord, index: number) {
  const durationSeconds = record.endedAt ? Math.max(30, Math.round((Date.parse(record.endedAt) - Date.parse(record.startedAt)) / 1000)) : 90 + index * 12

  return {
    id: record.id,
    startedAt: record.startedAt,
    durationLabel: `${durationSeconds}초`,
    markedSuccess: record.markedSuccess,
    resultLabel: record.markedSuccess === false ? '보류' : '좋은 시연',
  }
}

function buildChartData(mainTraining: MainTrainingStatus | null) {
  const episodes = mainTraining?.recentEpisodes ?? []
  if (episodes.length > 0) {
    return episodes.map((episode) => ({
      name: `실행 ${episode.episodeNumber}`,
      duration: episode.durationSeconds ?? 0,
    }))
  }

  return Array.from({ length: 6 }, (_, index) => ({
    name: `실행 ${Math.max((mainTraining?.totalEpisodes ?? 0) - 5 + index, index + 1)}`,
    duration: 4.2 + index * 0.25,
  }))
}

function buildOperationLog(
  mainTraining: MainTrainingStatus | null,
  interventionCount: number,
  savedCorrections: number,
  decisionSource: DecisionSource,
) {
  const episodeLogs = (mainTraining?.recentEpisodes ?? []).slice(-3).reverse().map((episode) => ({
    title: `실행 ${episode.episodeNumber} 완료`,
    detail: `${episode.success ? '성공' : '실패'} · 소요 ${episode.durationSeconds?.toFixed(1) ?? '0.0'}초`,
    timestamp: formatTimeOnly(episode.startedAt),
  }))

  return [
    { title: '현재 판단 기준', detail: DECISION_SOURCE_LABELS[decisionSource], timestamp: '지금' },
    { title: '수동 개입 누적', detail: `${interventionCount}회`, timestamp: '지금' },
    { title: '저장한 보정', detail: `${savedCorrections}건`, timestamp: '지금' },
    ...episodeLogs,
  ]
}

function pickRecommendedCheckpoint(checkpoints: Checkpoint[]) {
  if (checkpoints.length === 0) {
    return null
  }

  return [...checkpoints].sort((left, right) => {
    if (right.successRate !== left.successRate) {
      return right.successRate - left.successRate
    }
    return left.averageDuration - right.averageDuration
  })[0]
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatTimeOnly(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}
