import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { IS_TOUCH } from '../utils/input'

/**
 * Glow on light sources only: the threshold sits above anything sunlit, so just emissive
 * lamps, fairy lights and fireflies bloom. Neutral tone mapping keeps the designed colors.
 */
export function Effects() {
  return (
    <EffectComposer multisampling={IS_TOUCH ? 0 : 4}>
      <Bloom mipmapBlur luminanceThreshold={1.4} luminanceSmoothing={0.3} intensity={0.9} radius={0.7} />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
    </EffectComposer>
  )
}
