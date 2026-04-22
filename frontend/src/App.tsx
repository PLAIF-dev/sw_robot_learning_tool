import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './app/components/layout/AppLayout'
import { LoginPage } from './app/pages/LoginPage'
import { DashboardPage } from './app/pages/DashboardPage'
import { TasksPage } from './app/pages/SessionsPage'
import { TrainingPage } from './app/pages/TrainingPage'
import { ReviewPage } from './app/pages/ReviewPage'
import { CheckpointsPage } from './app/pages/CheckpointsPage'
import { SystemPage } from './app/pages/SystemPage'
import { RobotViewerPage } from './app/pages/RobotViewerPage'
import { useAuthStore } from './app/store/authStore'

function ProtectedApp() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <AppLayout />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/app" element={<ProtectedApp />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="training" element={<TrainingPage />} />
        <Route path="review" element={<ReviewPage />} />
        <Route path="checkpoints" element={<CheckpointsPage />} />
        <Route path="robot" element={<RobotViewerPage />} />
        <Route path="system" element={<SystemPage />} />
        <Route index element={<Navigate to="/app/dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
    </Routes>
  )
}
