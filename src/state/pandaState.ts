import * as THREE from 'three'

export interface IPandaState {
  position: THREE.Vector3
  /** Horizontal velocity in m/s. */
  velocity: THREE.Vector3
  /** Click-to-walk destination; cleared on arrival, on any key/drag input, or when stuck. */
  walkTarget: THREE.Vector3 | null
  /** Runs once the panda reaches walkTarget (e.g. sit down after clicking the laptop). */
  onArrive: (() => void) | null
}

/**
 * Live panda state: written by Panda every frame, read by the camera, zones and trees.
 * Lives outside React because it changes every frame.
 */
export const panda: IPandaState = {
  position: new THREE.Vector3(),
  velocity: new THREE.Vector3(),
  walkTarget: null,
  onArrive: null,
}

export function walkTo(target: THREE.Vector3, onArrive: (() => void) | null = null) {
  panda.walkTarget = target.clone()
  panda.onArrive = onArrive
}
