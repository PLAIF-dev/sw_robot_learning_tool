import { KEYMAP_HELP } from '../../constants'

export function KeyboardHelpModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="panel w-full max-w-lg p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-100">키보드 TCP 조작 도움말</h3>
          <button className="rounded-lg border border-white/10 px-3 py-1 text-sm text-slate-300" onClick={onClose}>
            닫기
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {KEYMAP_HELP.map((item) => (
            <div key={item.target} className="panel-muted p-4">
              <div className="text-sm font-semibold text-slate-100">{item.target}</div>
              <div className="mt-1 text-sm text-slate-300">{item.keys}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-400">
          이동/회전 모드는 우측 상시 패널의 TCP 조작 카드에서 전환합니다.
        </p>
      </div>
    </div>
  )
}
