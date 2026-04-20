import { useEffect } from 'react'
import { useControlStore } from '../store/controlStore'

const LEFT_KEYS = {
  KeyW: ['left', 1, 0, 0],
  KeyS: ['left', -1, 0, 0],
  KeyA: ['left', 0, 1, 0],
  KeyD: ['left', 0, -1, 0],
  KeyQ: ['left', 0, 0, 1],
  KeyE: ['left', 0, 0, -1],
} as const

const RIGHT_KEYS = {
  ArrowUp: ['right', 1, 0, 0],
  ArrowDown: ['right', -1, 0, 0],
  ArrowLeft: ['right', 0, 1, 0],
  ArrowRight: ['right', 0, -1, 0],
  PageUp: ['right', 0, 0, 1],
  PageDown: ['right', 0, 0, -1],
} as const

export function useKeyboardTcp(enabled: boolean) {
  const stepSize = useControlStore((state) => state.stepSize)
  const move = useControlStore((state) => state.move)

  useEffect(() => {
    if (!enabled) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      const activeElement = document.activeElement
      if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
        return
      }

      const mapping = LEFT_KEYS[event.code as keyof typeof LEFT_KEYS] ?? RIGHT_KEYS[event.code as keyof typeof RIGHT_KEYS]
      if (!mapping) {
        return
      }

      event.preventDefault()
      const [target, dx, dy, dz] = mapping
      void move(target, dx * stepSize, dy * stepSize, dz * stepSize)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, move, stepSize])
}
