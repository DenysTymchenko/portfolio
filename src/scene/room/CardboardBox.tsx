import { RoundedBox } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'

export interface ICardboardBoxProps {
  position: [number, number, number]
  size: number
  /** Rotation around Y, radians. */
  turn: number
}

/** A taped cardboard box the panda can knock over. */
export function CardboardBox({ position, size, turn }: ICardboardBoxProps) {
  return (
    <RigidBody colliders="cuboid" position={position} rotation-y={turn} friction={0.8} mass={0.6}>
      <RoundedBox args={[size, size, size]} radius={size * 0.12} smoothness={1} castShadow receiveShadow>
        <meshStandardMaterial color="#E9B47A" roughness={1} flatShading />
      </RoundedBox>
      <mesh position-y={size / 2 + 0.002} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[size * 0.22, size * 0.9]} />
        <meshStandardMaterial color="#F6D7A8" roughness={1} />
      </mesh>
    </RigidBody>
  )
}
