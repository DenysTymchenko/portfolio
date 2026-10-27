import { useMemo, type ReactNode } from 'react'
import * as THREE from 'three'
import { useDiorama } from '../../hooks/useDiorama'

interface IAnchoredProps {
  /** Name of an empty in diorama.glb (Anchor_*). */
  to: string
  children: ReactNode
}

/** Places its children at a named empty from the diorama; the empty's +Z faces out of the surface. */
export function Anchored({ to, children }: IAnchoredProps) {
  const { node } = useDiorama()
  const { position, quaternion } = useMemo(() => {
    const anchor = node(to)
    return {
      position: anchor.getWorldPosition(new THREE.Vector3()),
      quaternion: anchor.getWorldQuaternion(new THREE.Quaternion()),
    }
  }, [node, to])
  return (
    <group position={position} quaternion={quaternion}>
      {children}
    </group>
  )
}
