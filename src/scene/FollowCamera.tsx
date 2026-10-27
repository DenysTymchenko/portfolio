import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useDiorama } from '../hooks/useDiorama'
import { useAppState } from '../state/appState'
import { panda } from '../state/pandaState'
import { input } from '../utils/input'

const FOLLOW_DIR = new THREE.Vector3(0.22, 0.62, 1).normalize()
const INTRO_DIR = new THREE.Vector3(0.17, 0.5, 1).normalize()
const INTRO_TARGET = new THREE.Vector3(0.2, 0.9, -0.3)
const ZOOM = { min: 4, max: 18, initial: 8.5 }

/** Distance at which a halfW x halfH box fills the view. */
function fitDistance(camera: THREE.PerspectiveCamera, aspect: number, halfW: number, halfH: number) {
  const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
  return Math.max(halfH / tanV, halfW / (tanV * aspect))
}

/**
 * Fixed-angle follow camera. Before the first input it holds a shot of the whole diorama;
 * at the laptop it moves onto the screen; near the boards it leans towards them.
 */
export function FollowCamera() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const { node, point } = useDiorama()
  const shots = useMemo(() => {
    const screen = node('Anchor_LaptopScreen')
    return {
      screen: screen.getWorldPosition(new THREE.Vector3()),
      screenDir: screen.getWorldDirection(new THREE.Vector3()), // +Z of the anchor = screen normal
      projects: point('Anchor_ProjectBoard'),
      jobs: point('Anchor_JobBoard'),
    }
  }, [node, point])
  const rig = useRef({
    target: INTRO_TARGET.clone(),
    dir: INTRO_DIR.clone(),
    distance: 34,
    zoom: ZOOM.initial,
    goal: new THREE.Vector3(),
    goalDir: new THREE.Vector3(),
  })

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1)
    const r = rig.current
    const { started, seated, zone, jobId } = useAppState.getState()
    const aspect = state.size.width / state.size.height
    r.zoom = THREE.MathUtils.clamp(r.zoom + input.zoom, ZOOM.min, ZOOM.max)
    input.zoom = 0

    let distance: number
    if (!started) {
      r.goal.copy(INTRO_TARGET)
      r.goalDir.copy(INTRO_DIR)
      distance = Math.min(60, fitDistance(camera, aspect, 8.6, 4.6))
    } else if (seated) {
      r.goal.copy(shots.screen)
      r.goalDir.copy(shots.screenDir)
      distance = fitDistance(camera, aspect, 0.23, 0.15)
    } else {
      r.goal.copy(panda.position).y += 0.6
      r.goalDir.copy(FOLLOW_DIR)
      distance = r.zoom * (aspect < 1 ? 1.4 : 1)
      if (zone === 'vinyl') {
        r.goal.lerp(shots.projects, 0.55)
        distance = Math.min(distance, 5.5 * (aspect < 1 ? 1.6 : 1))
      } else if (zone === 'garden' && jobId) {
        r.goal.lerp(shots.jobs, 0.35)
      }
    }

    const k = 1 - Math.exp(-4 * dt)
    r.target.lerp(r.goal, k)
    r.dir.lerp(r.goalDir, k).normalize()
    r.distance = THREE.MathUtils.lerp(r.distance, distance, 1 - Math.exp(-3 * dt))
    camera.position.copy(r.target).addScaledVector(r.dir, r.distance)
    camera.lookAt(r.target)
  })

  return null
}
