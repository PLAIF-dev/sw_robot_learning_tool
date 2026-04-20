import { useEffect } from 'react'
import { useDeviceStore } from '../store/deviceStore'

export function useDevicePolling(interval = 5000) {
  const fetchStatus = useDeviceStore((state) => state.fetchStatus)

  useEffect(() => {
    fetchStatus()
    const timer = window.setInterval(fetchStatus, interval)
    return () => window.clearInterval(timer)
  }, [fetchStatus, interval])
}
