import { useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { IExperience } from '../../data/experience'
import { useAppState } from '../../state/appState'
import { panda } from '../../state/pandaState'
import { Apple } from './Apple'

/** Where apples hang: [azimuth, elevation] in radians around the canopy, facing the camera (+Z). */
const HANG_DIRECTIONS: [number, number][] = [
  [0.15, -0.25],
  [-0.7, 0.05],
  [0.8, -0.4],
  [-0.3, -0.55],
  [0.45, 0.25],
  [-1.05, -0.3],
]
const BUMP_DISTANCE = 0.56 // panda centre to trunk centre: touching (0.3 capsule + 0.16 trunk) plus a little
const BUMP_SPEED = 1.2
const BUMP_AIM = 0.5 // cos of the angle between heading and trunk: walking into it, not past it
const FADED_OPACITY = 0.25

interface IAppleTreeProps {
  /** The tree's Tree_N_Canopy object from the diorama (its origin is the canopy centre). */
  canopy: THREE.Object3D
  /** The jobs hanging on this tree, in drop order. */
  jobs: IExperience[]
  /** Changes whenever this tree should shake (E / tap pressed next to it); 0 = never. */
  shakeSignal: number
}

/** Fade state of the canopy: it turns see-through while it hides the panda from the camera. */
interface ICanopyFade {
  materials: THREE.Material[]
  radius: number
  opacity: number
}

/** Hang `count` apples on the canopy surface by raycasting inward from outside the tree. */
function hangApples(canopy: THREE.Object3D, center: THREE.Vector3, count: number) {
  const ray = new THREE.Raycaster()
  return Array.from({ length: count }, (_, i) => {
    const [azimuth, elevation] = HANG_DIRECTIONS[i % HANG_DIRECTIONS.length]
    const dir = new THREE.Vector3(
      Math.sin(azimuth) * Math.cos(elevation),
      Math.sin(elevation),
      Math.cos(azimuth) * Math.cos(elevation),
    )
    ray.set(center.clone().addScaledVector(dir, 5), dir.clone().negate())
    const hit = ray.intersectObject(canopy, true)[0]
    return hit ? hit.point.addScaledVector(dir, 0.06) : center.clone().addScaledVector(dir, 1)
  })
}

/**
 * One apple tree from the diorama. It holds its apples, shakes one loose when the panda walks
 * into the trunk (or presses E nearby), and fades out while it hides the panda.
 */
export function AppleTree({ canopy, jobs, shakeSignal }: IAppleTreeProps) {
  const center = useMemo(() => canopy.getWorldPosition(new THREE.Vector3()), [canopy])
  const hangAt = useMemo(() => hangApples(canopy, center, jobs.length), [canopy, center, jobs.length])
  const wobble = useRef({ amount: 0, cooldown: 0 })
  const fade = useRef<ICanopyFade | null>(null)
  const sightline = useMemo(() => ({ line: new THREE.Line3(), eye: new THREE.Vector3(), closest: new THREE.Vector3() }), [])

  // Own copies of the leaf materials, so this canopy can fade without fading the other trees.
  useLayoutEffect(() => {
    const materials: THREE.Material[] = []
    canopy.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.material = (mesh.material as THREE.Material).clone()
      materials.push(mesh.material)
    })
    const radius = new THREE.Box3().setFromObject(canopy).getBoundingSphere(new THREE.Sphere()).radius
    fade.current = { materials, radius, opacity: 1 }
  }, [canopy])

  const shake = () => {
    wobble.current = { amount: 1, cooldown: 1 }
    const { dropped, dropApple, showJob } = useAppState.getState()
    const next = jobs.find((job) => !dropped.includes(job.id))
    if (next) {
      dropApple(next.id)
      showJob(next.id)
    }
  }

  useEffect(() => {
    if (shakeSignal) shake()
  }, [shakeSignal])

  useFrame((state, dt) => {
    // Fade while the canopy sits between the camera and the panda.
    if (fade.current) {
      const f = fade.current
      sightline.eye.copy(panda.position).y += 0.5
      sightline.line.set(state.camera.position, sightline.eye)
      sightline.line.closestPointToPoint(center, true, sightline.closest)
      const hides = sightline.closest.distanceTo(center) < f.radius * 0.8
      f.opacity = THREE.MathUtils.damp(f.opacity, hides ? FADED_OPACITY : 1, 8, dt)
      for (const m of f.materials) {
        m.transparent = f.opacity < 0.99
        m.depthWrite = !m.transparent
        m.opacity = f.opacity
      }
    }

    // Shake when the panda walks into the trunk (not just past it).
    const w = wobble.current
    w.cooldown = Math.max(0, w.cooldown - dt)
    const dx = center.x - panda.position.x
    const dz = center.z - panda.position.z
    const distance = Math.hypot(dx, dz)
    const speed = panda.velocity.length()
    const aim = speed > 0 ? (panda.velocity.x * dx + panda.velocity.z * dz) / (speed * distance) : 0
    if (w.cooldown === 0 && speed > BUMP_SPEED && distance < BUMP_DISTANCE && aim > BUMP_AIM) shake()

    const t = state.clock.elapsedTime
    w.amount = THREE.MathUtils.damp(w.amount, 0, 3, dt)
    canopy.rotation.z = Math.sin(t * 22) * 0.07 * w.amount
    canopy.rotation.x = Math.cos(t * 19) * 0.05 * w.amount
  })

  return jobs.map((job, i) => <Apple key={job.id} job={job} hangAt={hangAt[i]} />)
}
