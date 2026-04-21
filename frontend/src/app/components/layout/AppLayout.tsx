import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { useDevicePolling } from '../../hooks/useDevicePolling'
import { useAuthStore } from '../../store/authStore'
import { useControlStore } from '../../store/controlStore'
import { useTaskStore } from '../../store/sessionStore'
import { EventLog } from './EventLog'
import { RightPanel } from './RightPanel'
import { SideNav } from './SideNav'
import { TopBar } from './TopBar'

export function AppLayout() {
  const restoreAuth = useAuthStore((state) => state.restore)
  const fetchTasks = useTaskStore((state) => state.fetchTasks)
  const refreshControl = useControlStore((state) => state.refresh)
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)

  useDevicePolling()

  useEffect(() => {
    void restoreAuth()
    void fetchTasks()
    void refreshControl()
  }, [fetchTasks, refreshControl, restoreAuth])

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <SideNav collapsed={leftCollapsed} />

        <div className="relative flex min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setLeftCollapsed((value) => !value)}
            className="absolute left-0 top-4 z-20 rounded-r-xl border border-l-0 border-white/10 bg-slate-950/90 px-2 py-3 text-slate-300 transition hover:bg-slate-900"
            aria-label={leftCollapsed ? '왼쪽 패널 펼치기' : '왼쪽 패널 접기'}
          >
            {leftCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          <main className="min-w-0 flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>

          <button
            type="button"
            onClick={() => setRightCollapsed((value) => !value)}
            className="absolute right-0 top-4 z-20 rounded-l-xl border border-r-0 border-white/10 bg-slate-950/90 px-2 py-3 text-slate-300 transition hover:bg-slate-900"
            aria-label={rightCollapsed ? '오른쪽 패널 펼치기' : '오른쪽 패널 접기'}
          >
            {rightCollapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        <RightPanel collapsed={rightCollapsed} />
      </div>
      <EventLog />
    </div>
  )
}
