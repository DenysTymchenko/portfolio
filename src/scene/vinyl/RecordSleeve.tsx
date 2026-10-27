import { useCursor } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { IProject } from '../../data/projects'
import { useAppState } from '../../state/appState'
import { walkTo } from '../../state/pandaState'
import { isClick } from '../../utils/input'

const SIZE = 0.3

interface IRecordSleeveProps {
  project: IProject
  /** Bottom centre of the cabinet cubby the sleeve stands in. */
  cubby: THREE.Vector3
  /** Where the panda walks to when the sleeve is clicked from afar. */
  standAt: THREE.Vector3
}

/** Cover art drawn from the project's colors: a disc and the title. */
function coverTexture(project: IProject) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 256
  const g = canvas.getContext('2d')!
  g.fillStyle = project.cover.bg
  g.fillRect(0, 0, 256, 256)
  g.fillStyle = project.cover.fg
  g.beginPath()
  g.arc(128, 108, 72, 0, Math.PI * 2)
  g.fill()
  g.fillStyle = project.cover.bg
  g.beginPath()
  g.arc(128, 108, 16, 0, Math.PI * 2)
  g.fill()
  g.fillStyle = project.cover.fg
  g.font = '800 28px Nunito, sans-serif'
  g.textAlign = 'center'
  g.fillText(project.title, 128, 224)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

/** One project as a record sleeve in the cabinet: slides out on hover, plays when clicked. */
export function RecordSleeve({ project, cubby, standAt }: IRecordSleeveProps) {
  const ref = useRef<THREE.Group>(null!)
  const [hover, setHover] = useState(false)
  const playing = useAppState((s) => s.projectId === project.id)
  const playProject = useAppState((s) => s.playProject)
  useCursor(hover)

  const materials = useMemo(() => {
    const edge = new THREE.MeshStandardMaterial({ color: project.cover.bg, roughness: 1 })
    const front = new THREE.MeshStandardMaterial({ map: coverTexture(project), roughness: 1 })
    return [edge, edge, edge, edge, front, edge] // BoxGeometry face order: +x -x +y -y +z -z
  }, [project])

  const rest = cubby.z - 0.02
  useFrame((_, dt) => {
    const out = playing ? 0.2 : hover ? 0.07 : 0
    ref.current.position.z = THREE.MathUtils.damp(ref.current.position.z, rest + out, 10, dt)
  })

  return (
    <group
      ref={ref}
      position={[cubby.x, cubby.y + SIZE / 2 + 0.005, rest]}
      rotation-x={-0.12}
      onClick={(e) => {
        if (!isClick(e)) return
        e.stopPropagation()
        playProject(project.id)
        if (useAppState.getState().zone !== 'vinyl') walkTo(standAt)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHover(true)
      }}
      onPointerOut={() => setHover(false)}
    >
      <mesh material={materials} castShadow receiveShadow>
        <boxGeometry args={[SIZE, SIZE, 0.012]} />
      </mesh>
    </group>
  )
}
