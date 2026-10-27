import { useCursor } from '@react-three/drei'
import { createPortal, useFrame, type ThreeEvent } from '@react-three/fiber'
import { useLayoutEffect, useState } from 'react'
import type * as THREE from 'three'
import { useStore, type Focus } from '../store'
import { LaptopScreen } from './LaptopScreen'
import { useRoom } from './useRoom'

const POI_BY_NAME: Record<string, Focus> = {
  Desk: 'desk',
  Laptop: 'desk',
  Laptop_Display: 'desk',
  Chair: 'desk',
  Desk_Lamp: 'desk',
  Vinyl_Cabinet: 'vinyl',
  Turntable: 'vinyl',
  Turntable_Platter: 'vinyl',
  Speaker_L: 'vinyl',
  Speaker_R: 'vinyl',
  Wall_Records: 'vinyl',
  Garden_Path: 'garden',
  Apple_Basket: 'garden',
}

/** Walks up from the hit mesh: multi-material objects load as a group of meshes. */
function focusFor(object: THREE.Object3D | null): Focus | null {
  for (let o = object; o; o = o.parent) {
    if (POI_BY_NAME[o.name]) return POI_BY_NAME[o.name]
    if (/^Tree_\d+_/.test(o.name)) return 'garden'
  }
  return null
}

// Glowing parts shouldn't block the sun.
const NO_SHADOW = /^(Window_Back|Laptop_Display|Desk_Lamp|Floor_Lamp)/

export function Room() {
  const { scene, node } = useRoom()
  const focus = useStore((s) => s.focus)
  const setFocus = useStore((s) => s.setFocus)
  const playing = useStore((s) => s.projectId !== null)
  const [hovered, setHovered] = useState<Focus | null>(null)
  useCursor(hovered !== null)

  useLayoutEffect(() => {
    scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = !NO_SHADOW.test(o.name) && !NO_SHADOW.test(o.parent?.name ?? '')
        o.receiveShadow = true
      }
    })
  }, [scene])

  useFrame((_, dt) => {
    if (playing) node('Turntable_Platter').rotation.y -= dt * 3.5
  })

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    const f = focusFor(e.object)
    setHovered(f && f !== focus ? f : null)
  }
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    const f = focusFor(e.object)
    if (f && f !== focus) {
      e.stopPropagation()
      setFocus(f)
    }
  }

  return (
    <>
      <primitive object={scene} onPointerMove={onMove} onPointerOut={() => setHovered(null)} onClick={onClick} />
      {createPortal(<LaptopScreen visible={focus === 'desk'} />, node('Anchor_LaptopScreen'))}
    </>
  )
}
