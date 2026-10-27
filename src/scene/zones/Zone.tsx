import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useAppState, type ZoneId } from '../../state/appState'
import { panda } from '../../state/pandaState'

interface IZoneProps {
  id: ZoneId
  center: THREE.Vector3
  /** A round zone, marked by a glowing ring on the floor… */
  radius?: number
  /** …or a rectangular area [width along x, depth along z], with no ring. */
  size?: [number, number]
}

/** One point of interest: notices when the panda walks in or out, and marks itself on the floor. */
export function Zone({ id, center, radius, size }: IZoneProps) {
  const active = useAppState((s) => s.zone === id)
  const ring = useRef<THREE.MeshBasicMaterial>(null)

  useFrame((state) => {
    const p = panda.position
    const inside =
      radius !== undefined
        ? Math.hypot(p.x - center.x, p.z - center.z) < radius
        : size !== undefined && Math.abs(p.x - center.x) < size[0] / 2 && Math.abs(p.z - center.z) < size[1] / 2
    const { zone, setZone } = useAppState.getState()
    if (inside && zone !== id) setZone(id)
    else if (!inside && zone === id) setZone(null)

    if (ring.current) {
      const pulse = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 3)
      ring.current.opacity = active ? 0.85 : 0.25 + 0.2 * pulse
    }
  })

  if (radius === undefined) return null
  return (
    <mesh position={[center.x, center.y + 0.012, center.z]} rotation-x={-Math.PI / 2}>
      <ringGeometry args={[0.5, 0.58, 48]} />
      <meshBasicMaterial ref={ring} color="#FFFFFF" transparent toneMapped={false} />
    </mesh>
  )
}
