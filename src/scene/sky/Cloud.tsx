import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

/** A cloud is a few overlapping puffs: [x, y, z, size], relative to the cloud's centre. */
const PUFFS: [number, number, number, number][] = [
  [0, 0, 0, 1],
  [0.9, -0.15, 0.1, 0.75],
  [-0.85, -0.2, 0, 0.7],
  [0.3, 0.45, -0.1, 0.65],
]
const WRAP = 18 // clouds drift right and wrap around at ±WRAP

// Shared by every cloud.
const geometry = new THREE.IcosahedronGeometry(1, 1)
const material = new THREE.MeshStandardMaterial({
  color: '#FFD6C6',
  emissive: '#FF8E7A', // blushing in the sunset
  emissiveIntensity: 0.35,
  flatShading: true,
  roughness: 1,
})

export interface ICloudProps {
  position: [number, number, number]
  scale: number
  /** Drift speed to the right, m/s. */
  speed: number
}

/** One faceted low-poly cloud drifting past the island. */
export function Cloud({ position, scale, speed }: ICloudProps) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((_, dt) => {
    const cloud = ref.current
    cloud.position.x += speed * dt
    if (cloud.position.x > WRAP) cloud.position.x = -WRAP
  })
  return (
    <group ref={ref} position={position} scale={scale}>
      {PUFFS.map(([x, y, z, size], i) => (
        <mesh key={i} geometry={geometry} material={material} position={[x, y, z]} scale={[size * 1.2, size * 0.8, size]} />
      ))}
    </group>
  )
}
