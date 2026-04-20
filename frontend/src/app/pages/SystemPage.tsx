import { useEffect, useState } from 'react'
import { systemApi } from '../api/system'
import { useDeviceStore } from '../store/deviceStore'

export function SystemPage() {
  const deviceStatus = useDeviceStore((state) => state.status)
  const [info, setInfo] = useState<{ version: string; environment: string; dotnetVersion: string; machineName: string; backendPort: number } | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    void systemApi.getInfo().then(setInfo)
    void systemApi.getLogs().then(setLogs)
  }, [])

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <section className="panel p-6">
        <div className="section-title">시스템 정보</div>
        {info && (
          <div className="mt-4 space-y-3">
            <div className="panel-muted p-4 text-sm text-slate-300">버전: {info.version}</div>
            <div className="panel-muted p-4 text-sm text-slate-300">환경: {info.environment}</div>
            <div className="panel-muted p-4 text-sm text-slate-300">.NET: {info.dotnetVersion}</div>
            <div className="panel-muted p-4 text-sm text-slate-300">장비: {info.machineName}</div>
            <div className="panel-muted p-4 text-sm text-slate-300">백엔드 포트: {info.backendPort}</div>
          </div>
        )}
        <div className="mt-6 section-title">장치 연결 상태</div>
        <div className="mt-3 space-y-2 text-sm text-slate-300">
          <div className="panel-muted p-3">왼팔: {deviceStatus?.leftArm.state ?? '알 수 없음'}</div>
          <div className="panel-muted p-3">오른팔: {deviceStatus?.rightArm.state ?? '알 수 없음'}</div>
          <div className="panel-muted p-3">컨트롤러: {deviceStatus?.controller.state ?? '알 수 없음'}</div>
        </div>
      </section>

      <section className="panel p-6">
        <div className="section-title">최근 로그</div>
        <div className="mt-4 space-y-2">
          {logs.map((log) => (
            <div key={log} className="panel-muted p-3 text-sm text-slate-300">
              {log}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
