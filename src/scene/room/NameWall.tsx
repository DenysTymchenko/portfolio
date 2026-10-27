import { Text } from '@react-three/drei'
import { profile } from '../../data/profile'
import { TEXT_COLORS } from '../../utils/colors'
import { FONT_BOLD } from '../../utils/fonts'
import { Anchored } from '../shared/Anchored'

/** Your name and role, painted big on the left wall. */
export function NameWall() {
  return (
    <Anchored to="Anchor_NameWall">
      <Text font={FONT_BOLD} fontSize={0.5} color={TEXT_COLORS.red} anchorY="bottom" position={[0, 0.06, 0.005]}>
        {profile.name}
      </Text>
      <Text font={FONT_BOLD} fontSize={0.2} color={TEXT_COLORS.brown} anchorY="top" position={[0, -0.02, 0.005]}>
        {profile.role}
      </Text>
    </Anchored>
  )
}
