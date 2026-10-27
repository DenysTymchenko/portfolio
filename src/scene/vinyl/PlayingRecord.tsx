import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { IProject } from '../../data/projects'
import { useDiorama } from '../../hooks/useDiorama'

const SPIN = 3.5 // radians per second

interface IPlayingRecordProps {
  project: IProject
}

/** The record on the turntable: pops in when a project is picked and spins with the platter. */
export function PlayingRecord({ project }: IPlayingRecordProps) {
  const { node, point } = useDiorama()
  const at = useMemo(() => point('Anchor_Platter'), [point])
  const platter = useMemo(() => node('Turntable_Platter'), [node])
  const ref = useRef<THREE.Group>(null!)

  useFrame((_, dt) => {
    const record = ref.current
    record.rotation.y -= dt * SPIN
    record.scale.setScalar(THREE.MathUtils.damp(record.scale.x, 1, 8, dt))
    platter.rotation.y -= dt * SPIN
  })

  return (
    <group ref={ref} position={at} scale={0.01}>
      <mesh castShadow position-y={0.003}>
        <cylinderGeometry args={[0.15, 0.15, 0.006, 16]} />
        <meshStandardMaterial color="#3B3552" roughness={1} flatShading />
      </mesh>
      <mesh position-y={0.0065}>
        <cylinderGeometry args={[0.055, 0.055, 0.002, 12]} />
        <meshStandardMaterial color={project.cover.bg} roughness={1} flatShading />
      </mesh>
    </group>
  )
}
