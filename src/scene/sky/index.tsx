import { useThree } from '@react-three/fiber'
import { useLayoutEffect } from 'react'
import * as THREE from 'three'
import { Cloud, type ICloudProps } from './Cloud'

/** Summer-evening sky, top to horizon: deep blue, lavender, coral, gold. */
const GRADIENT: [number, string][] = [
  [0, '#3F5AA6'],
  [0.45, '#A98BCB'],
  [0.78, '#F59A84'],
  [1, '#FFC98C'],
]

/** Around and below the island, never between it and the camera. */
const CLOUDS: ICloudProps[] = [
  { position: [-13, 2.5, -9], scale: 1.6, speed: 0.25 },
  { position: [11, 4, -11], scale: 2, speed: 0.18 },
  { position: [-4, 6.5, -15], scale: 1.4, speed: 0.3 },
  { position: [14, -1.5, -4], scale: 1.3, speed: 0.22 },
  { position: [-14, -2.5, -2], scale: 1.5, speed: 0.2 },
  { position: [3, -4.5, -8], scale: 1.8, speed: 0.15 },
]

/** The sunset gradient behind everything, and the clouds. */
export function Sky() {
  const scene = useThree((s) => s.scene)
  useLayoutEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 2
    canvas.height = 256
    const g = canvas.getContext('2d')!
    const gradient = g.createLinearGradient(0, 0, 0, 256)
    for (const [stop, color] of GRADIENT) gradient.addColorStop(stop, color)
    g.fillStyle = gradient
    g.fillRect(0, 0, 2, 256)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    scene.background = texture
    return () => {
      scene.background = null
      texture.dispose()
    }
  }, [scene])

  return CLOUDS.map((cloud, i) => <Cloud key={i} {...cloud} />)
}
