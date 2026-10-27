import { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import CameraControlsImpl from 'camera-controls'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useStore, type Focus } from '../store'
import { useRoom } from './useRoom'

/** What to frame: a box of halfW x halfH around `target`, seen from direction `dir`. */
type Shot = { target: THREE.Vector3; dir: THREE.Vector3; halfW: number; halfH: number; panel?: boolean }

// Keep in sync with .panel in styles.css: side panel width (+ margin) and bottom-sheet height.
const PANEL_PX = 420
const SHEET = 0.46
const WIDE = 900
const UP = new THREE.Vector3(0, 1, 0)

export function CameraRig() {
  const ref = useRef<CameraControlsImpl>(null!)
  const focus = useStore((s) => s.focus)
  const { node, point } = useRoom()
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const { width, height } = useThree((s) => s.size)

  const shots = useMemo<Record<Focus, Shot>>(() => {
    const screen = node('Anchor_LaptopScreen')
    return {
      overview: {
        target: new THREE.Vector3(0.2, 0.9, -0.3),
        dir: new THREE.Vector3(3, 9.6, 17.8).normalize(),
        halfW: 8.9,
        halfH: 4.6,
      },
      desk: {
        target: screen.getWorldPosition(new THREE.Vector3()),
        dir: screen.getWorldDirection(new THREE.Vector3()), // +Z of the anchor = screen normal
        halfW: 0.23,
        halfH: 0.15,
      },
      vinyl: {
        target: point('Focus_Vinyl').add(new THREE.Vector3(0, 0.3, 0)),
        dir: new THREE.Vector3(0.3, 0.3, 1).normalize(),
        halfW: 1.25,
        halfH: 0.9,
        panel: true,
      },
      garden: {
        target: point('Focus_Garden').add(new THREE.Vector3(-0.2, -0.2, 0)),
        dir: new THREE.Vector3(0.2, 0.45, 1).normalize(),
        halfW: 3.9,
        halfH: 2.6,
        panel: true,
      },
    }
  }, [node, point])

  useEffect(() => {
    const c = ref.current
    c.mouseButtons.right = CameraControlsImpl.ACTION.NONE
    c.touches.two = CameraControlsImpl.ACTION.TOUCH_DOLLY
    c.touches.three = CameraControlsImpl.ACTION.NONE
  }, [])

  useEffect(() => {
    const c = ref.current
    const shot = shots[focus]
    const aspect = width / height
    const side = shot.panel && width >= WIDE
    const sheet = shot.panel && width < WIDE
    const freeW = side ? (width - PANEL_PX) / width : 1
    const freeH = sheet ? 1 - SHEET : 1
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    const dist = Math.min(40, Math.max(shot.halfH / (tanV * freeH), shot.halfW / (tanV * aspect * freeW)))

    // Shift the target so the framed box sits in the part of the screen the panel leaves free.
    const right = shot.dir.clone().negate().cross(UP).normalize()
    const up = right.clone().cross(shot.dir.clone().negate())
    const target = shot.target.clone()
    if (side) target.addScaledVector(right, (PANEL_PX / 2 / width) * 2 * dist * tanV * aspect)
    if (sheet) target.addScaledVector(up, -(SHEET / 2) * 2 * dist * tanV)
    const position = target.clone().addScaledVector(shot.dir, dist)

    const azimuth = Math.atan2(shot.dir.x, shot.dir.z)
    const polar = Math.acos(shot.dir.y)
    const overview = focus === 'overview'
    const swing = overview ? 0.6 : 0.3
    c.minAzimuthAngle = azimuth - swing
    c.maxAzimuthAngle = azimuth + swing
    c.minPolarAngle = Math.max(0.2, polar - (overview ? 0.35 : 0.2))
    c.maxPolarAngle = Math.min(1.45, polar + 0.2)
    c.minDistance = dist * (overview ? 0.4 : 0.6)
    c.maxDistance = dist * 1.5
    c.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z, true)
  }, [focus, shots, camera, width, height])

  return <CameraControls ref={ref} makeDefault smoothTime={0.6} />
}
