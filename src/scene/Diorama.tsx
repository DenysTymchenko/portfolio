import { useCursor } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { RigidBody, TrimeshCollider } from '@react-three/rapier'
import { useLayoutEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { useDiorama } from '../hooks/useDiorama'
import { useAppState } from '../state/appState'
import { walkTo } from '../state/pandaState'
import { isClick } from '../utils/input'
import { stylize } from '../utils/materials'

// Thin wall decorations: their shadows would only smear onto the wall behind them.
const NO_SHADOW = /^(Window_Back|Laptop_Display|String_Lights|Project_Board)/
// Decoration the panda walks through (or that sits flush on the floor).
const NO_COLLIDE = /^(Rug|Laptop_Display|Window_Back|Garden_Path|Grass_Tufts|Flowers|String_Lights|Curtains|Tree_\d+_Canopy)/
// Surfaces you can click to walk the panda there.
const FLOORS = /^(Room_Floor|Island|Garden_Deck|Garden_Path|Rug|Grass_Tufts)/

// Clicking these parts of the model sends the panda to the matching point of interest.
type ClickTarget = 'desk' | 'vinyl' | 'tree' | 'jobs' // a union, so it can't be an interface
const CLICK_TARGETS: [RegExp, ClickTarget][] = [
  [/^(Desk|Laptop|Chair|Mug|Plant_Desk)/, 'desk'],
  [/^(Vinyl_Cabinet|Turntable|Speaker_|Project_Board)/, 'vinyl'],
  [/^Tree_\d+_/, 'tree'],
  [/^Job_Board/, 'jobs'],
]

/** The object (or its parent) whose name matches: multi-material objects load as a group of meshes. */
function named(object: THREE.Object3D | null, pattern: RegExp) {
  for (let o = object; o; o = o.parent) if (pattern.test(o.name)) return o
  return null
}

function clickTargetOf(object: THREE.Object3D): ClickTarget | null {
  for (const [pattern, target] of CLICK_TARGETS) if (named(object, pattern)) return target
  return null
}

/** One static trimesh collider for everything solid in the diorama. */
function useStaticCollider(scene: THREE.Object3D) {
  return useMemo(() => {
    scene.updateMatrixWorld(true)
    const vertices: number[] = []
    const indices: number[] = []
    const v = new THREE.Vector3()
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh || named(mesh, NO_COLLIDE)) return
      const pos = mesh.geometry.attributes.position
      const base = vertices.length / 3
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld)
        vertices.push(v.x, v.y, v.z)
      }
      const index = mesh.geometry.index
      for (let i = 0; i < (index ? index.count : pos.count); i++) indices.push(base + (index ? index.getX(i) : i))
    })
    return [new Float32Array(vertices), new Uint32Array(indices)] as [Float32Array, Uint32Array]
  }, [scene])
}

/**
 * The model from Blender — room, garden and island — plus the collider the panda walks on, and
 * click-to-walk: click the floor to go there, or furniture to go to that point of interest.
 */
export function Diorama() {
  const { scene, point } = useDiorama()
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  const collider = useStaticCollider(scene)
  const destinations = useMemo(
    () => ({
      desk: point('Spot_Desk'),
      vinyl: point('Zone_Vinyl'),
      jobs: point('Anchor_JobBoard').add(new THREE.Vector3(0, 0, 1)),
    }),
    [point],
  )

  useLayoutEffect(() => {
    stylize(scene)
    scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = !named(o, NO_SHADOW)
        o.receiveShadow = true
      }
    })
  }, [scene])

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (!isClick(e)) return
    e.stopPropagation()
    const app = useAppState.getState()
    app.start()
    const target = clickTargetOf(e.object)
    if (target === 'desk') {
      if (app.zone === 'desk') app.sit()
      else walkTo(destinations.desk, app.sit)
    } else if (target === 'vinyl') {
      walkTo(destinations.vinyl)
    } else if (target === 'jobs') {
      walkTo(destinations.jobs)
    } else if (target === 'tree') {
      // Stop just short of the trunk, then shake that (now nearest) tree.
      const tree = named(e.object, /^Tree_\d+_/)!
      const at = tree.name.endsWith('Canopy') ? tree.getWorldPosition(new THREE.Vector3()) : e.point
      walkTo(new THREE.Vector3(at.x, 0, at.z + 0.95), () => useAppState.getState().interact())
    } else if (named(e.object, FLOORS)) {
      walkTo(e.point)
    }
  }

  return (
    <>
      <RigidBody type="fixed" colliders={false}>
        <TrimeshCollider args={collider} />
      </RigidBody>
      <primitive
        object={scene}
        onClick={onClick}
        onPointerMove={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation()
          setHovered(clickTargetOf(e.object) !== null)
        }}
        onPointerOut={() => setHovered(false)}
      />
    </>
  )
}
