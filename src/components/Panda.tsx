import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useStore, type Focus } from '../store'
import { useRoom } from './useRoom'

const PANDA_URL = '/models/panda.glb'
const SPEED = 1.1 // m/s

const SPOTS = ['Desk', 'Vinyl', 'Rug', 'Nap', 'Sofa', 'DoorIn', 'DoorOut', 'Garden'] as const
type Spot = (typeof SPOTS)[number]

/** Walkable straight lines between Spot_* empties in room.glb (checked clear of furniture). */
const LINKS: [Spot, Spot][] = [
  ['Desk', 'Rug'],
  ['Desk', 'Vinyl'],
  ['Vinyl', 'Rug'],
  ['Vinyl', 'DoorIn'],
  ['Rug', 'Nap'],
  ['Rug', 'Sofa'],
  ['Sofa', 'Nap'],
  ['Rug', 'DoorIn'],
  ['Nap', 'DoorIn'],
  ['DoorIn', 'DoorOut'],
  ['DoorOut', 'Garden'],
]
const WANDER: Spot[] = ['Rug', 'Sofa', 'Nap', 'Desk', 'Vinyl', 'Garden']
const FOCUS_SPOT: Partial<Record<Focus, Spot>> = { desk: 'Desk', vinyl: 'Vinyl', garden: 'Garden' }
/** On arrival: face a room node, or a fixed heading in radians (0 = towards the camera). */
const FACING: Record<Spot, string | number> = {
  Desk: 'Focus_Desk',
  Vinyl: 0.5,
  Garden: -0.3,
  Rug: 0,
  Nap: 0,
  Sofa: 0.3,
  DoorIn: 0,
  DoorOut: 0,
}

/** Breadth-first search over LINKS; returns the spots from `from` to `to`, both included. */
function route(from: Spot, to: Spot): Spot[] {
  const prev = new Map<Spot, Spot | null>([[from, null]])
  const queue: Spot[] = [from]
  while (queue.length) {
    const cur = queue.shift()!
    if (cur === to) break
    for (const [a, b] of LINKS) {
      const next = a === cur ? b : b === cur ? a : null
      if (next && !prev.has(next)) {
        prev.set(next, cur)
        queue.push(next)
      }
    }
  }
  const path: Spot[] = []
  for (let s: Spot | null | undefined = to; s; s = prev.get(s)) path.unshift(s)
  return path
}

function dampAngle(from: number, to: number, lambda: number, dt: number) {
  const delta = Math.atan2(Math.sin(to - from), Math.cos(to - from))
  return from + delta * (1 - Math.exp(-lambda * dt))
}

/**
 * The panda is built from rigid parts (see blender/scripts/build_panda.py), each pivoting at
 * its joint, so walking, sitting and waving are all procedural rotations here.
 */
export function Panda() {
  const { scene, nodes } = useGLTF(PANDA_URL)
  const room = useRoom()
  const focus = useStore((s) => s.focus)
  const root = useRef<THREE.Group>(null!)
  const bob = useRef<THREE.Group>(null!)

  const spots = useMemo(
    () => Object.fromEntries(SPOTS.map((s) => [s, room.point(`Spot_${s}`)])) as Record<Spot, THREE.Vector3>,
    [room],
  )
  const facePoints = useMemo(
    () =>
      Object.fromEntries(
        Object.values(FACING)
          .filter((f): f is string => typeof f === 'string')
          .map((name) => [name, room.point(name)]),
      ),
    [room],
  )
  const sim = useRef({ at: 'Rug' as Spot, path: [] as Spot[], time: 0, rest: 2, yaw: 0, walk: 0, sit: 0, wave: 0, waveUntil: 0 })

  useLayoutEffect(() => {
    scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) o.castShadow = true
    })
    root.current.position.copy(spots.Rug)
  }, [scene, spots])

  const goTo = (target: Spot) => {
    const s = sim.current
    const from = s.path[0] ?? s.at // mid-walk: re-route from the spot we're heading to
    s.path = s.path.length ? [from, ...route(from, target).slice(1)] : route(from, target).slice(1)
    if (!s.path.length && FOCUS_SPOT[useStore.getState().focus] === target) s.waveUntil = s.time + 1.8
  }

  useEffect(() => {
    const target = FOCUS_SPOT[focus]
    if (target) goTo(target)
  }, [focus])

  useFrame((state, dt) => {
    const s = sim.current
    const t = (s.time = state.clock.elapsedTime)
    const g = root.current
    const currentFocus = useStore.getState().focus
    let walking = false
    let heading = s.yaw

    const next = s.path[0]
    if (next) {
      const to = spots[next].clone().sub(g.position)
      const dist = to.length()
      const step = SPEED * dt
      if (dist <= step) {
        g.position.copy(spots[next])
        s.at = next
        s.path.shift()
        if (!s.path.length) {
          s.rest = t + 5 + Math.random() * 7
          if (FOCUS_SPOT[currentFocus] === next) s.waveUntil = t + 1.8
        }
      } else {
        g.position.addScaledVector(to, step / dist)
        heading = Math.atan2(to.x, to.z)
        walking = true
      }
    }
    if (!walking) {
      const face = FACING[s.at]
      heading =
        typeof face === 'number'
          ? face
          : Math.atan2(facePoints[face].x - g.position.x, facePoints[face].z - g.position.z)
      if (currentFocus === 'overview' && !s.path.length && t > s.rest) {
        const options = WANDER.filter((w) => w !== s.at)
        goTo(options[Math.floor(Math.random() * options.length)])
      }
    }

    s.yaw = dampAngle(s.yaw, heading, 8, dt)
    g.rotation.y = s.yaw
    s.walk = THREE.MathUtils.damp(s.walk, walking ? 1 : 0, 10, dt)
    s.sit = THREE.MathUtils.damp(s.sit, !walking && s.at === 'Nap' ? 1 : 0, 6, dt)
    s.wave = THREE.MathUtils.damp(s.wave, t < s.waveUntil ? 1 : 0, 10, dt)

    const phase = t * 10
    const swing = Math.sin(phase) * 0.6 * s.walk
    nodes.Panda_LegL.rotation.x = swing - 1.4 * s.sit
    nodes.Panda_LegR.rotation.x = -swing - 1.4 * s.sit
    nodes.Panda_ArmL.rotation.x = -swing * 0.8 - 0.5 * s.sit
    nodes.Panda_ArmR.rotation.x = swing * 0.8 - 0.5 * s.sit
    nodes.Panda_ArmR.rotation.z = s.wave * (-2.6 + Math.sin(t * 12) * 0.35)
    nodes.Panda_Head.rotation.z = Math.sin(t * 1.3) * 0.06 * (1 - s.walk)
    nodes.Panda_Head.rotation.x = Math.sin(t * 0.7) * 0.04
    nodes.Panda_Tail.rotation.y = Math.sin(t * (2 + 6 * s.walk)) * (0.25 + 0.15 * s.walk)
    bob.current.position.y = Math.abs(Math.sin(phase)) * 0.04 * s.walk - 0.22 * s.sit
    bob.current.scale.y = 1 + Math.sin(t * 2.2) * 0.012 * (1 - s.walk)
  })

  return (
    <group ref={root}>
      <group ref={bob}>
        <primitive object={scene} />
      </group>
    </group>
  )
}

useGLTF.preload(PANDA_URL)
