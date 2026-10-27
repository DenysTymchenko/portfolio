import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

export const ROOM_URL = '/models/room.glb'

/**
 * The diorama exported from blender/scripts/build_room.py. Besides meshes it carries named
 * empties (Spot_*, Focus_*, Anchor_*, Light_*) that place things in code without hardcoding.
 */
export function useRoom() {
  const gltf = useGLTF(ROOM_URL)
  return useMemo(() => {
    gltf.scene.updateMatrixWorld(true)
    const node = (name: string) => {
      const found = gltf.nodes[name]
      if (!found) throw new Error(`room.glb has no node "${name}"`)
      return found
    }
    const point = (name: string) => node(name).getWorldPosition(new THREE.Vector3())
    return { scene: gltf.scene, node, point }
  }, [gltf])
}

useGLTF.preload(ROOM_URL)
