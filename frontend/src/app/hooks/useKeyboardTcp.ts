import { useEffect, useRef } from 'react'
import { useControlStore } from '../store/controlStore'

const KEY_REPEAT_MS = 75
const KEYBOARD_STEP_MULTIPLIER = 30

const KEY_BINDINGS = {
  KeyW: ['right', 0, 1, 0],
  KeyS: ['right', 0, -1, 0],
  KeyA: ['right', -1, 0, 0],
  KeyD: ['right', 1, 0, 0],
  KeyQ: ['right', 0, 0, 1],
  KeyE: ['right', 0, 0, -1],
  KeyU: ['left', 0, 1, 0],
  KeyJ: ['left', 0, -1, 0],
  KeyH: ['left', -1, 0, 0],
  KeyK: ['left', 1, 0, 0],
  KeyY: ['left', 0, 0, 1],
  KeyI: ['left', 0, 0, -1],
} as const

export function useKeyboardTcp(enabled: boolean) {
  const stepSize = useControlStore((state) => state.stepSize)
  const move = useControlStore((state) => state.move)
  const moveRef = useRef(move)
  const stepSizeRef = useRef(stepSize)
  const pressedKeysRef = useRef<Set<string>>(new Set())
  const timerRef = useRef<number | null>(null)
  const inFlightRef = useRef(false)

  useEffect(() => {
    moveRef.current = move
  }, [move])

  useEffect(() => {
    stepSizeRef.current = stepSize
  }, [stepSize])

  useEffect(() => {
    function stopLoop() {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    function clearPressedKeys() {
      pressedKeysRef.current.clear()
      stopLoop()
    }

    function flushPressedKeys() {
      if (inFlightRef.current || pressedKeysRef.current.size === 0) {
        return
      }

      const deltaByTarget = new Map<'left' | 'right', { dx: number; dy: number; dz: number }>()
      for (const code of pressedKeysRef.current) {
        const mapping = KEY_BINDINGS[code as keyof typeof KEY_BINDINGS]
        if (!mapping) {
          continue
        }

        const [target, dx, dy, dz] = mapping
        const current = deltaByTarget.get(target) ?? { dx: 0, dy: 0, dz: 0 }
        current.dx += dx
        current.dy += dy
        current.dz += dz
        deltaByTarget.set(target, current)
      }

      if (deltaByTarget.size === 0) {
        return
      }

      inFlightRef.current = true
      const step = stepSizeRef.current * KEYBOARD_STEP_MULTIPLIER
      const moves = [...deltaByTarget.entries()]
        .filter(([, delta]) => delta.dx !== 0 || delta.dy !== 0 || delta.dz !== 0)
        .map(([target, delta]) => moveRef.current(target, delta.dx * step, delta.dy * step, delta.dz * step, 'move', 'world'))

      void Promise.allSettled(moves).finally(() => {
        inFlightRef.current = false
      })
    }

    function startLoop() {
      if (timerRef.current !== null) {
        return
      }

      timerRef.current = window.setInterval(flushPressedKeys, KEY_REPEAT_MS)
    }

    if (!enabled) {
      clearPressedKeys()
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      const activeElement = document.activeElement
      if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
        return
      }

      const mapping = KEY_BINDINGS[event.code as keyof typeof KEY_BINDINGS]
      if (!mapping) {
        return
      }

      event.preventDefault()
      const isNewPress = !pressedKeysRef.current.has(event.code)
      pressedKeysRef.current.add(event.code)
      if (isNewPress) {
        flushPressedKeys()
      }
      startLoop()
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (!pressedKeysRef.current.delete(event.code)) {
        return
      }

      if (pressedKeysRef.current.size === 0) {
        stopLoop()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', clearPressedKeys)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', clearPressedKeys)
      clearPressedKeys()
    }
  }, [enabled])
}
