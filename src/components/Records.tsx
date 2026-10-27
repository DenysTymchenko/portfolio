import { useCursor } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { projects, type Project } from '../content/projects'
import { useStore } from '../store'
import { useRoom } from './useRoom'

const SLEEVE = 0.3
const MAX_RECORDS = 8 // one per cubby

function coverTexture(p: Project) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 256
  const g = canvas.getContext('2d')!
  g.fillStyle = p.cover.bg
  g.fillRect(0, 0, 256, 256)
  g.fillStyle = p.cover.fg
  g.beginPath()
  g.arc(128, 108, 72, 0, Math.PI * 2)
  g.fill()
  g.fillStyle = p.cover.bg
  g.beginPath()
  g.arc(128, 108, 16, 0, Math.PI * 2)
  g.fill()
  g.fillStyle = p.cover.fg
  g.font = '800 28px Nunito, sans-serif'
  g.textAlign = 'center'
  g.fillText(p.title, 128, 224)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

function Sleeve({ project, slot }: { project: Project; slot: THREE.Vector3 }) {
  const ref = useRef<THREE.Group>(null!)
  const [hover, setHover] = useState(false)
  const selected = useStore((s) => s.projectId === project.id)
  const openProject = useStore((s) => s.openProject)
  useCursor(hover)

  const materials = useMemo(() => {
    const edge = new THREE.MeshStandardMaterial({ color: project.cover.bg, roughness: 0.8 })
    const front = new THREE.MeshStandardMaterial({ map: coverTexture(project), roughness: 0.7 })
    return [edge, edge, edge, edge, front, edge] // BoxGeometry face order: +x -x +y -y +z -z
  }, [project])

  const rest = slot.z - 0.02
  useFrame((_, dt) => {
    const out = selected ? 0.2 : hover ? 0.07 : 0
    ref.current.position.z = THREE.MathUtils.damp(ref.current.position.z, rest + out, 10, dt)
  })

  return (
    <group
      ref={ref}
      position={[slot.x, slot.y + SLEEVE / 2 + 0.005, rest]}
      rotation-x={-0.12}
      onClick={(e) => {
        e.stopPropagation()
        openProject(project.id)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHover(true)
      }}
      onPointerOut={() => setHover(false)}
    >
      <mesh material={materials} castShadow receiveShadow>
        <boxGeometry args={[SLEEVE, SLEEVE, 0.012]} />
      </mesh>
    </group>
  )
}

function SpinningRecord({ project, at }: { project: Project; at: THREE.Vector3 }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((_, dt) => {
    const g = ref.current
    g.rotation.y -= dt * 3.5
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, 1, 8, dt))
  })
  return (
    <group ref={ref} position={at} scale={0.01}>
      <mesh castShadow position-y={0.002}>
        <cylinderGeometry args={[0.15, 0.15, 0.004, 48]} />
        <meshStandardMaterial color="#151215" roughness={0.3} />
      </mesh>
      <mesh position-y={0.0045}>
        <cylinderGeometry args={[0.05, 0.05, 0.001, 32]} />
        <meshStandardMaterial color={project.cover.bg} />
      </mesh>
    </group>
  )
}

export function Records() {
  const { point } = useRoom()
  const projectId = useStore((s) => s.projectId)
  const playing = projects.find((p) => p.id === projectId)
  const slots = useMemo(() => projects.slice(0, MAX_RECORDS).map((_, i) => point(`Anchor_Cubby_${i}`)), [point])

  return (
    <>
      {slots.map((slot, i) => (
        <Sleeve key={projects[i].id} project={projects[i]} slot={slot} />
      ))}
      {playing && <SpinningRecord key={playing.id} project={playing} at={point('Anchor_Platter')} />}
    </>
  )
}
