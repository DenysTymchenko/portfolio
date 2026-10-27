import { RigidBody } from '@react-three/rapier'
import { useMemo } from 'react'
import * as THREE from 'three'

const COLORS = ['#F2664A', '#FFFFFF', '#FFC24B', '#FFFFFF', '#45B5AA', '#FFFFFF']

/** A texture of vertical stripes, one per color. */
function stripes(colors: string[]) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 8
  const g = canvas.getContext('2d')!
  colors.forEach((c, i) => {
    g.fillStyle = c
    g.fillRect((i * 256) / colors.length, 0, 256 / colors.length, 8)
  })
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/** A bouncy ball on the lawn for the panda to push around. */
export function BeachBall() {
  const map = useMemo(() => stripes(COLORS), [])
  return (
    <RigidBody colliders="ball" position={[4.8, 0.4, 2.25]} restitution={0.75} friction={0.6} linearDamping={0.3} angularDamping={0.3} mass={0.3}>
      <mesh castShadow receiveShadow>
        {/* 12 segments around = 2 per stripe, so the facets line up with the colors */}
        <sphereGeometry args={[0.28, 12, 7]} />
        <meshStandardMaterial map={map} roughness={1} flatShading />
      </mesh>
    </RigidBody>
  )
}
