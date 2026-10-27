import { Html, useCursor } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { experience, type Job } from '../content/experience'
import { useStore } from '../store'
import { useRoom } from './useRoom'

const TREES = ['Tree_1_Canopy', 'Tree_2_Canopy', 'Tree_3_Canopy']
// [azimuth, elevation] in radians around each canopy, biased to the side facing the camera (+Z).
const SPREAD: [number, number][] = [
  [0.15, -0.25],
  [-0.7, 0.05],
  [0.8, -0.4],
  [-0.3, -0.55],
  [0.45, 0.25],
  [-1.05, -0.3],
]

/** Hang apples on the canopy surface by raycasting inward from outside the tree. */
function placeApples(canopies: THREE.Object3D[], count: number) {
  const ray = new THREE.Raycaster()
  return Array.from({ length: count }, (_, i) => {
    const canopy = canopies[i % canopies.length]
    const [az, el] = SPREAD[Math.floor(i / canopies.length) % SPREAD.length]
    const center = canopy.getWorldPosition(new THREE.Vector3())
    const dir = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el))
    ray.set(center.clone().addScaledVector(dir, 5), dir.clone().negate())
    const hit = ray.intersectObject(canopy, true)[0]
    return hit ? hit.point.addScaledVector(dir, 0.06) : center.addScaledVector(dir, 1)
  })
}

function Apple({ job, at }: { job: Job; at: THREE.Vector3 }) {
  const ref = useRef<THREE.Group>(null!)
  const [hover, setHover] = useState(false)
  const selected = useStore((s) => s.jobId === job.id)
  const openJob = useStore((s) => s.openJob)
  useCursor(hover)

  useFrame((state, dt) => {
    const g = ref.current
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, selected ? 1.4 : hover ? 1.2 : 1, 10, dt))
    g.rotation.z = Math.sin(state.clock.elapsedTime * 1.4 + at.x * 3) * 0.08
  })

  return (
    <group
      ref={ref}
      position={at}
      onClick={(e) => {
        e.stopPropagation()
        openJob(job.id)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHover(true)
      }}
      onPointerOut={() => setHover(false)}
    >
      <mesh castShadow scale={[1, 0.9, 1]}>
        <sphereGeometry args={[0.12, 10, 8]} />
        <meshStandardMaterial
          color={job.color}
          roughness={0.45}
          flatShading
          emissive={job.color}
          emissiveIntensity={selected ? 0.4 : 0}
        />
      </mesh>
      <mesh position-y={0.12}>
        <cylinderGeometry args={[0.008, 0.012, 0.07, 5]} />
        <meshStandardMaterial color="#5E2F1D" />
      </mesh>
      <mesh position={[0.035, 0.135, 0]} rotation-z={-0.6} scale={[1, 0.25, 0.6]}>
        <sphereGeometry args={[0.045, 6, 4]} />
        <meshStandardMaterial color="#6E9A3E" flatShading />
      </mesh>
      <Html center position-y={0.32}>
        <div className={hover || selected ? 'tag' : 'tag is-hidden'}>{job.company}</div>
      </Html>
    </group>
  )
}

export function Apples() {
  const { node } = useRoom()
  const spots = useMemo(() => placeApples(TREES.map(node), experience.length), [node])
  return (
    <>
      {experience.map((job, i) => (
        <Apple key={job.id} job={job} at={spots[i]} />
      ))}
    </>
  )
}
