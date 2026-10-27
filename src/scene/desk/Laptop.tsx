import { Text } from '@react-three/drei'
import { useAppState } from '../../state/appState'
import { FONT_BOLD, FONT_REGULAR } from '../../utils/fonts'
import { IS_TOUCH } from '../../utils/input'
import { Anchored } from '../shared/Anchored'
import { LaptopPage } from './LaptopPage'

/** The laptop's screen: a "sit down to read" prompt, then the real page once the panda sits. */
export function Laptop() {
  const seated = useAppState((s) => s.seated)
  return (
    <Anchored to="Anchor_LaptopScreen">
      {!seated && (
        <>
          <Text font={FONT_BOLD} fontSize={0.03} color="#F0B144" position={[0, 0.03, 0.003]}>
            ~/about.md
          </Text>
          <Text font={FONT_REGULAR} fontSize={0.018} color="#FFF1DC" position={[0, -0.02, 0.003]}>
            {IS_TOUCH ? 'tap the laptop to sit down' : 'sit down to read (E)'}
          </Text>
        </>
      )}
      <LaptopPage visible={seated} />
    </Anchored>
  )
}
