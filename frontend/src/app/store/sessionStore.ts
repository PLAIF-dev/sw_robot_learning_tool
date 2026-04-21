import { create } from 'zustand'
import { tasksApi } from '../api/sessions'
import type { TaskItem, TaskMode } from '../types'

interface TaskState {
  tasks: TaskItem[]
  activeTask: TaskItem | null
  fetchTasks: () => Promise<void>
  activateTask: (id: string) => Promise<void>
  createTask: (name: string, mode: TaskMode, description: string, baseCheckpointId?: string) => Promise<void>
  duplicateTask: (id: string) => Promise<void>
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  activeTask: null,

  async fetchTasks() {
    const tasks = await tasksApi.getAll()
    set({
      tasks,
      activeTask: tasks.find((task) => task.isActive) ?? null,
    })
  },

  async activateTask(id) {
    await tasksApi.activate(id)
    await get().fetchTasks()
  },

  async createTask(name, mode, description, baseCheckpointId) {
    await tasksApi.create({ name, mode, description, baseCheckpointId })
    await get().fetchTasks()
  },

  async duplicateTask(id) {
    await tasksApi.duplicate(id)
    await get().fetchTasks()
  },
}))
