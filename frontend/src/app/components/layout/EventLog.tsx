import { useEffect, useState } from 'react'
import { systemApi } from '../../api/system'

export function EventLog() {
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    let mounted = true
    systemApi.getLogs().then((items) => {
      if (mounted) {
        setLogs(items.slice(-5).reverse())
      }
    })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="border-t border-white/10 bg-slate-950/55 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="section-title">이벤트 로그</div>
        <div className="text-xs text-slate-500">최근 5건</div>
      </div>
      <div className="grid gap-2 lg:grid-cols-5">
        {logs.map((log) => (
          <div key={log} className="panel-muted min-h-[64px] p-3 text-xs text-slate-300">
            {log}
          </div>
        ))}
      </div>
    </div>
  )
}
