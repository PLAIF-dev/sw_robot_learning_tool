import { TRAINING_STAGE_LABELS } from '../../constants'
import { useControlStore } from '../../store/controlStore'
import { useDeviceStore } from '../../store/deviceStore'
import { useTaskStore } from '../../store/sessionStore'
import { StatusBadge } from '../common/StatusBadge'

function StatusRow({ label, online, detail }: { label: string; online: boolean; detail?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1 text-sm">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${online ? 'bg-emerald-400' : 'bg-rose-400'}`} />
        <span className="text-slate-200">{label}</span>
      </div>
      <span className="text-xs text-slate-400">{detail ?? (online ? '연결됨' : '오프라인')}</span>
    </div>
  )
}

export function RightPanel({
  collapsed,
}: {
  collapsed: boolean
}) {
  const deviceStatus = useDeviceStore((state) => state.status)
  const activeTask = useTaskStore((state) => state.activeTask)
  const ikSuccess = useControlStore((state) => state.ikSuccess)

  return (
    <aside className={`${collapsed ? 'w-0 border-l-0 p-0' : 'w-[360px] border-l border-white/10 p-4'} shrink-0 overflow-hidden bg-slate-950/50 transition-[width,padding] duration-200`}>
      {!collapsed && (
        <div className="space-y-4">
          <section className="panel p-4">
            <div className="section-title">로봇 상태</div>
            <div className="mt-3">
              <StatusRow label="왼팔" online={deviceStatus?.leftArm.connected ?? false} detail={deviceStatus?.leftArm.state} />
              <StatusRow label="오른팔" online={deviceStatus?.rightArm.connected ?? false} detail={deviceStatus?.rightArm.state} />
              <StatusRow label="제어 장치" online={deviceStatus?.controller.connected ?? false} detail={deviceStatus?.controller.state} />
            </div>
          </section>

          <section className="panel p-4">
            <div className="section-title">카메라 / 그리퍼</div>
            <div className="mt-3 space-y-2">
              <StatusRow label="Left Camera" online={deviceStatus?.leftCamera.connected ?? false} detail={`${deviceStatus?.leftCamera.width ?? 0}x${deviceStatus?.leftCamera.height ?? 0}`} />
              <StatusRow label="Right Camera" online={deviceStatus?.rightCamera.connected ?? false} detail={`${deviceStatus?.rightCamera.width ?? 0}x${deviceStatus?.rightCamera.height ?? 0}`} />
              <StatusRow label="Head Camera" online={deviceStatus?.headCamera.connected ?? false} detail={`${deviceStatus?.headCamera.width ?? 0}x${deviceStatus?.headCamera.height ?? 0}`} />
              <StatusRow label="왼쪽 그리퍼" online={deviceStatus?.leftGripper.connected ?? false} detail={`${deviceStatus?.leftGripper.openPercent ?? 0}%`} />
              <StatusRow label="오른쪽 그리퍼" online={deviceStatus?.rightGripper.connected ?? false} detail={`${deviceStatus?.rightGripper.openPercent ?? 0}%`} />
            </div>
          </section>

          <section className="panel p-4">
            <div className="section-title">현재 작업 / 단계</div>
            <div className="mt-3 space-y-2">
              {activeTask ? (
                <>
                  <div className="text-sm font-semibold text-slate-100">{activeTask.name}</div>
                  <div className="flex gap-2">
                    <StatusBadge tone={activeTask.mode === 'NewTraining' ? 'info' : 'warning'}>
                      {activeTask.mode === 'NewTraining' ? '신규 작업' : '추가 작업'}
                    </StatusBadge>
                    <StatusBadge>{TRAINING_STAGE_LABELS[activeTask.currentStage]}</StatusBadge>
                  </div>
                </>
              ) : (
                <div className="text-sm text-slate-400">활성 작업을 선택해 주세요.</div>
              )}
              {ikSuccess !== null && <StatusBadge tone={ikSuccess ? 'success' : 'danger'}>{ikSuccess ? 'IK 정상' : 'IK 실패'}</StatusBadge>}
            </div>
          </section>
        </div>
      )}
    </aside>
  )
}
