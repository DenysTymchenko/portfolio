import { Billboard, Text, useCursor } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { BallCollider, RigidBody } from '@react-three/rapier'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import type { IExperience } from '../../data/experience'
import { useAppState } from '../../state/appState'
import { FONT_BOLD } from '../../utils/fonts'
import { isClick } from '../../utils/input'

const RADIUS = 0.12

interface IAppleProps {
  job: IExperience
  /** Where it hangs on its tree's canopy. */
  hangAt: THREE.Vector3
}

/**
 * One job as an apple. It sways on the branch until its tree is shaken (or it's clicked),
 * then falls as a physics body; clicking it shows the job on the garden noticeboard.
 */
export function Apple({ job, hangAt }: IAppleProps) {
  const ref = useRef<THREE.Group>(null)
  const [hover, setHover] = useState(false)
  const selected = useAppState((s) => s.jobId === job.id)
  const dropped = useAppState((s) => s.dropped.includes(job.id))
  useCursor(hover)

  useFrame((state) => {
    if (ref.current) ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.4 + hangAt.x * 3) * 0.08
  })

  const handlers = {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      if (!isClick(e)) return
      e.stopPropagation()
      const app = useAppState.getState()
      app.start()
      app.dropApple(job.id)
      app.showJob(job.id)
    },
    onPointerOver: () => setHover(true),
    onPointerOut: () => setHover(false),
  }

  const glow = selected || (hover && !dropped)
  const model = (
    <>
      <mesh castShadow scale={[1, 0.9, 1]}>
        <sphereGeometry args={[RADIUS, 10, 8]} />
        <meshStandardMaterial color={job.color} roughness={1} flatShading emissive={job.color} emissiveIntensity={glow ? 0.45 : 0} />
      </mesh>
      <mesh position-y={0.12}>
        <cylinderGeometry args={[0.01, 0.014, 0.07, 5]} />
        <meshStandardMaterial color="#A8693F" roughness={1} flatShading />
      </mesh>
      <mesh position={[0.035, 0.135, 0]} rotation-z={-0.6} scale={[1, 0.25, 0.6]}>
        <sphereGeometry args={[0.05, 6, 4]} />
        <meshStandardMaterial color="#5DB548" roughness={1} flatShading />
      </mesh>
    </>
  )

  if (dropped) {
    return (
      <RigidBody colliders={false} position={hangAt} restitution={0.35} friction={0.9} linearDamping={0.4} angularDamping={0.6}>
        <BallCollider args={[RADIUS]} mass={0.2} />
        <group {...handlers}>{model}</group>
      </RigidBody>
    )
  }
  return (
    <group ref={ref} position={hangAt} {...handlers}>
      {model}
      {hover && (
        <Billboard position-y={0.32}>
          <Text font={FONT_BOLD} fontSize={0.12} color="#FBEEDD" outlineWidth={0.012} outlineColor="#2B1813">
            {job.company}
          </Text>
        </Billboard>
      )}
    </group>
  )
}
