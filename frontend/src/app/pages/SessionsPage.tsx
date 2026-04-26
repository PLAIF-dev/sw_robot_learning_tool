import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { TRAINING_STAGE_LABELS } from '../constants'
import { useTaskStore } from '../store/sessionStore'

export function TasksPage() {
  const tasks = useTaskStore((state) => state.tasks)
  const activeTask = useTaskStore((state) => state.activeTask)
  const createTask = useTaskStore((state) => state.createTask)
  const activateTask = useTaskStore((state) => state.activateTask)
  const duplicateTask = useTaskStore((state) => state.duplicateTask)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(activeTask?.id ?? null)

  const selectedTask = useMemo(
    () => tasks.find((taskItem) => taskItem.id === selectedTaskId) ?? null,
    [selectedTaskId, tasks],
  )

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      return
    }

    await createTask(name.trim(), description.trim())
    setName('')
    setDescription('')
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="panel p-6">
        <div className="section-title">작업 목록</div>
        <div className="mt-4 space-y-3">
          {tasks.map((taskItem) => (
            <button
              key={taskItem.id}
              className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                selectedTaskId === taskItem.id ? 'border-sky-400/50 bg-sky-500/10' : 'border-white/10 bg-white/5'
              }`}
              onClick={() => setSelectedTaskId(taskItem.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-slate-100">{taskItem.name}</div>
                  <div className="mt-2 text-sm text-slate-400">{taskItem.description}</div>
                </div>
                {taskItem.isActive && <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-200">현재 작업</span>}
              </div>
              <div className="mt-3 flex gap-2 text-xs text-slate-400">
                <span>{TRAINING_STAGE_LABELS[taskItem.currentStage]}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <div className="space-y-6">
        <section className="panel p-6">
          <div className="section-title">작업 생성</div>
          <form className="mt-4 space-y-4" onSubmit={handleCreate}>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="작업 이름"
            />
            <textarea
              className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="작업 설명"
            />
            <button className="w-full rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white" type="submit">
              작업 생성
            </button>
          </form>
        </section>

        <section className="panel p-6">
          <div className="section-title">작업 상세 패널</div>
          {selectedTask ? (
            <div className="mt-4 space-y-4">
              <div>
                <div className="text-xl font-semibold text-slate-100">{selectedTask.name}</div>
                <div className="mt-2 text-sm text-slate-400">{selectedTask.description}</div>
              </div>
              <div className="panel-muted p-4">
                <div className="section-title">현재 단계</div>
                <div className="mt-2 text-sm text-slate-100">{TRAINING_STAGE_LABELS[selectedTask.currentStage]}</div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white" onClick={() => void activateTask(selectedTask.id)}>
                  현재 작업으로 활성화
                </button>
                <button className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200" onClick={() => void duplicateTask(selectedTask.id)}>
                  작업 복제
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 text-sm text-slate-400">좌측 목록에서 작업을 선택해 주세요.</div>
          )}
        </section>
      </div>
    </div>
  )
}
