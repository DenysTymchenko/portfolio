import { Text } from '@react-three/drei'
import { FONT_BOLD } from '../../utils/fonts'
import { Anchored } from './Anchored'

interface IFloorTextProps {
  /** A floor anchor in diorama.glb (Anchor_Hint*); text lies flat, reading towards the back wall. */
  anchor: string
  text: string
  color: string
  opacity: number
  size: number
}

/** Text painted on the floor or the grass. */
export function FloorText({ anchor, text, color, opacity, size }: IFloorTextProps) {
  return (
    <Anchored to={anchor}>
      <Text font={FONT_BOLD} fontSize={size} lineHeight={1.65} textAlign="center" color={color} fillOpacity={opacity}>
        {text}
      </Text>
    </Anchored>
  )
}
