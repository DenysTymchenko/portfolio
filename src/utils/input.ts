import type { ThreeEvent } from '@react-three/fiber'
import type * as THREE from 'three'

interface IPoint {
  x: number
  y: number
}

/** Press-and-drag joystick: starts at (x0, y0), counts once it moves past DRAG_START px. */
interface IDrag extends IPoint {
  id: number
  x0: number
  y0: number
  active: boolean
}

export interface IInput {
  drag: IDrag | null
  jumpQueued: boolean
  /** Wheel / pinch delta, consumed by the camera. */
  zoom: number
}

export interface IInputActions {
  interact: () => void
  exit: () => void
}

/**
 * Keyboard, drag-to-walk and zoom input, kept outside React so the render loop can read it
 * every frame without re-rendering. Movement is in screen terms: x = right, y = forward.
 */
const held = new Set<string>()
const pointers = new Map<number, IPoint>()
let pinch = 0

export const input: IInput = {
  drag: null,
  jumpQueued: false,
  zoom: 0,
}

const DRAG_START = 10
const DRAG_RANGE = 70 // px of drag for full speed

const has = (...codes: string[]) => codes.some((c) => held.has(c))

export function readMove(out: THREE.Vector2) {
  out.set(0, 0)
  const d = input.drag
  if (d?.active) {
    out.set((d.x - d.x0) / DRAG_RANGE, -(d.y - d.y0) / DRAG_RANGE)
  } else {
    if (has('KeyW', 'ArrowUp')) out.y += 1
    if (has('KeyS', 'ArrowDown')) out.y -= 1
    if (has('KeyD', 'ArrowRight')) out.x += 1
    if (has('KeyA', 'ArrowLeft')) out.x -= 1
  }
  if (out.lengthSq() > 1) out.normalize()
  return out
}

export const isRunning = () => has('ShiftLeft', 'ShiftRight')

/** Coarse pointer = touch screen: show tap/drag hints instead of keyboard ones. */
export const IS_TOUCH = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches

/** True when a pointer-up should count as a click rather than the end of a drag. */
export const isClick = (e: ThreeEvent<MouseEvent>) => e.delta < DRAG_START

export function bindInput(el: HTMLElement, actions: IInputActions) {
  const typing = (e: KeyboardEvent) => e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement
  const onKeyDown = (e: KeyboardEvent) => {
    if (typing(e)) return
    held.add(e.code)
    if (e.code === 'Space') input.jumpQueued = true
    if (e.code === 'KeyE' || e.code === 'Enter') actions.interact()
    if (e.code === 'Escape') actions.exit()
    if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault()
  }
  const onKeyUp = (e: KeyboardEvent) => held.delete(e.code)
  const onBlur = () => held.clear()

  const onPointerDown = (e: PointerEvent) => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.size === 1 && e.button === 0) {
      input.drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, active: false }
    } else {
      input.drag = null // second finger: pinch instead of walking
      pinch = 0
    }
  }
  const onPointerMove = (e: PointerEvent) => {
    if (!pointers.has(e.pointerId)) return
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()]
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      if (pinch) input.zoom -= (dist - pinch) * 0.02
      pinch = dist
      return
    }
    const d = input.drag
    if (d && d.id === e.pointerId) {
      d.x = e.clientX
      d.y = e.clientY
      if (!d.active && Math.hypot(d.x - d.x0, d.y - d.y0) > DRAG_START) d.active = true
    }
  }
  const onPointerUp = (e: PointerEvent) => {
    pointers.delete(e.pointerId)
    if (input.drag?.id === e.pointerId) input.drag = null
    if (pointers.size < 2) pinch = 0
  }
  const onWheel = (e: WheelEvent) => {
    e.preventDefault()
    input.zoom += e.deltaY * 0.01
  }

  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('blur', onBlur)
  el.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)
  el.addEventListener('wheel', onWheel, { passive: false })
  return () => {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    window.removeEventListener('blur', onBlur)
    el.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', onPointerUp)
    el.removeEventListener('wheel', onWheel)
  }
}
