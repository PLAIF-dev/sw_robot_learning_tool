import { NavLink } from 'react-router-dom'
import { Archive, BookOpen, Gauge, Layers3, PlayCircle, Settings } from 'lucide-react'
import { ROUTES } from '../../constants'

const items = [
  { to: ROUTES.dashboard, label: '대시보드', icon: Gauge },
  { to: ROUTES.tasks, label: '작업', icon: Layers3 },
  { to: ROUTES.training, label: '학습 실행', icon: PlayCircle },
  { to: ROUTES.review, label: '기록 검토', icon: BookOpen },
  { to: ROUTES.checkpoints, label: '모델 / 체크포인트', icon: Archive },
  { to: ROUTES.system, label: '시스템', icon: Settings },
]

export function SideNav({
  collapsed,
}: {
  collapsed: boolean
}) {
  return (
    <aside className={`${collapsed ? 'w-0 border-r-0 p-0' : 'w-64 border-r border-white/10 p-4'} shrink-0 overflow-hidden bg-slate-950/50 transition-[width,padding] duration-200`}>
      {!collapsed && (
        <>
          <div className="mb-6 px-2">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Robot Learning Tool</div>
            <div className="mt-2 text-lg font-semibold text-slate-100">Task Operations</div>
          </div>
          <nav className="space-y-2">
            {items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                    isActive ? 'bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/40' : 'text-slate-300 hover:bg-white/5'
                  }`
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </>
      )}
    </aside>
  )
}
