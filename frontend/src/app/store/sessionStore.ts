import { create } from 'zustand'
import { tasksApi } from '../api/sessions'
import type { TaskItem } from '../types'

interface TaskState {
  tasks: TaskItem[]
  activeTask: TaskItem | null
  fetchTasks: () => Promise<void>
  activateTask: (id: string) => Promise<void>
  createTask: (name: string, description: string, baseCheckpointId?: string) => Promise<void>
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

  async createTask(name, description, baseCheckpointId) {
    await tasksApi.create({ name, mode: 'NewTraining', description, baseCheckpointId })
    await get().fetchTasks()
  },

  async duplicateTask(id) {
    await tasksApi.duplicate(id)
    await get().fetchTasks()
  },
}))
