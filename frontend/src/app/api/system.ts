import { safeGet } from './client'

export const systemApi = {
  getInfo: () =>
    safeGet('/system/info', {
      version: '0.1.0',
      environment: 'Development',
      dotnetVersion: '9.0.0',
      machineName: 'local-machine',
      backendPort: 8080,
    }),
  getLogs: () =>
    safeGet<string[]>('/system/logs/recent', [
      '[2026-04-20 09:00:01] INFO: 시스템 시작',
      '[2026-04-20 09:05:12] INFO: 데모 기록 시작',
    ]),
}
