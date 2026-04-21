import { useEffect } from 'react'
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
        <SideNav />
        <main className="min-w-0 flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
        <RightPanel />
      </div>
      <EventLog />
    </div>
  )
}
