import { Billboard, Text, useCursor } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import { useAppState, type ZoneId } from '../../state/appState'
import { panda } from '../../state/pandaState'
import { FONT_BOLD } from '../../utils/fonts'
import { IS_TOUCH } from '../../utils/input'

/** What "interact" (E / tap) does in each zone — see interact() in state/appState.ts. */
const ACTIONS: Record<ZoneId, string> = {
  desk: 'Sit at the laptop',
  vinyl: 'Play the next record',
  garden: 'Shake the nearest tree',
}

interface IZonePromptProps {
  zone: ZoneId
}

/** Speech bubble above the panda's head saying what E does here; tappable on touch screens. */
export function ZonePrompt({ zone }: IZonePromptProps) {
  const group = useRef<THREE.Group>(null!)
  const [hover, setHover] = useState(false)
  const interact = useAppState((s) => s.interact)
  useCursor(hover)
  useFrame(() => group.current.position.copy(panda.position).setY(panda.position.y + 1.55))
  const label = `${IS_TOUCH ? 'Tap' : 'E'}  ·  ${ACTIONS[zone]}`
  return (
    <group ref={group}>
      <Billboard>
        <mesh
          renderOrder={10}
          onClick={(e) => {
            e.stopPropagation()
            interact()
          }}
          onPointerOver={() => setHover(true)}
          onPointerOut={() => setHover(false)}
        >
          <planeGeometry args={[label.length * 0.062 + 0.2, 0.24]} />
          <meshBasicMaterial color={hover ? '#F2664A' : '#FFFFFF'} transparent opacity={0.95} depthTest={false} toneMapped={false} />
        </mesh>
        {/* Drawn over everything so trees and walls never hide the prompt. */}
        <Text
          font={FONT_BOLD}
          fontSize={0.11}
          color={hover ? '#FFFFFF' : '#3B2A22'}
          position-z={0.01}
          renderOrder={11}
          material-depthTest={false}
        >
          {label}
        </Text>
      </Billboard>
    </group>
  )
}
