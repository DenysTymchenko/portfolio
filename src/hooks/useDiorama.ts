import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

export const DIORAMA_URL = '/models/diorama.glb'

export interface IDiorama {
  scene: THREE.Group
  /** A named object from diorama.glb; throws if Blender didn't export it. */
  node: (name: string) => THREE.Object3D
  /** World position of a named object (a fresh vector each call). */
  point: (name: string) => THREE.Vector3
  /** Every object whose name matches, sorted by name — e.g. /^Tree_\d+_Canopy$/. */
  find: (pattern: RegExp) => THREE.Object3D[]
}

/**
 * The diorama (room + garden island) exported from blender/scripts/build_diorama.py. Besides
 * meshes it carries named empties (Spot_*, Zone_*, Anchor_*, Light_*) that place things in
 * code without hardcoding positions.
 */
export function useDiorama(): IDiorama {
  const gltf = useGLTF(DIORAMA_URL)
  return useMemo(() => {
    gltf.scene.updateMatrixWorld(true)
    const node = (name: string) => {
      const found = gltf.nodes[name]
      if (!found) throw new Error(`diorama.glb has no node "${name}"`)
      return found
    }
    const point = (name: string) => node(name).getWorldPosition(new THREE.Vector3())
    const find = (pattern: RegExp) =>
      Object.values(gltf.nodes)
        .filter((o) => pattern.test(o.name))
        .sort((a, b) => a.name.localeCompare(b.name))
    return { scene: gltf.scene, node, point, find }
  }, [gltf])
}

useGLTF.preload(DIORAMA_URL)
