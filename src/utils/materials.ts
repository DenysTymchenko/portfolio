import * as THREE from 'three'

/**
 * The scene's one look: matte, flat-shaded, no reflections. Applied to everything loaded from
 * Blender so materials can't drift towards "realistic" (see blender/scripts/toybox.py).
 */
export function stylize(root: THREE.Object3D) {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (!mesh.isMesh) return
    for (const m of [mesh.material].flat() as THREE.MeshStandardMaterial[]) {
      m.flatShading = true
      m.roughness = 1
      m.metalness = 0
      m.needsUpdate = true
    }
  })
}
