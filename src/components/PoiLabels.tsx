import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useStore, type Focus } from '../store'
import { useRoom } from './useRoom'

const LABELS: { focus: Focus; node: string; lift: number; text: string }[] = [
  { focus: 'desk', node: 'Focus_Desk', lift: 0.75, text: 'About me' },
  { focus: 'vinyl', node: 'Focus_Vinyl', lift: 1.15, text: 'Projects' },
  { focus: 'garden', node: 'Focus_Garden', lift: 2.1, text: 'Experience' },
]

/**
 * Floating buttons over the three points of interest, shown in the overview only. They stay
 * mounted and are hidden with CSS: unmounting drei's Html mid-render logs React 19 errors.
 */
export function PoiLabels() {
  const visible = useStore((s) => s.focus === 'overview')
  const setFocus = useStore((s) => s.setFocus)
  const { point } = useRoom()
  return LABELS.map((l) => (
    <Html key={l.focus} center position={point(l.node).add(new THREE.Vector3(0, l.lift, 0))} zIndexRange={[10, 0]}>
      <button
        className={visible ? 'poi' : 'poi is-hidden'}
        tabIndex={visible ? 0 : -1}
        aria-hidden={!visible}
        onClick={() => setFocus(l.focus)}
      >
        {l.text}
      </button>
    </Html>
  ))
}
