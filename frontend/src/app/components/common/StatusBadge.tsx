import type { PropsWithChildren } from 'react'

const toneMap = {
  neutral: 'bg-white/10 text-slate-200 border border-white/10',
  success: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30',
  warning: 'bg-amber-500/20 text-amber-200 border border-amber-400/30',
  danger: 'bg-rose-500/20 text-rose-200 border border-rose-400/30',
  info: 'bg-sky-500/20 text-sky-200 border border-sky-400/30',
} as const

export function StatusBadge({
  children,
  tone = 'neutral',
}: PropsWithChildren<{ tone?: keyof typeof toneMap }>) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${toneMap[tone]}`}>
      {children}
    </span>
  )
}
