import { Physics } from '@react-three/rapier'
import { Laptop } from './Laptop'
import { Diorama } from './Diorama'
import { Effects } from './Effects'
import { FollowCamera } from './FollowCamera'
import { Garden } from './Garden'
import { Lights } from './Lights'
import { Panda } from './Panda'
import { Room } from './Room'
import { Sky } from './Sky'
import { VinylCorner } from './VinylCorner'
import { Zones } from './Zones'

/**
 * The whole world. The diorama model is the stage; the panda walks on it; the three points of
 * interest (desk, vinyl corner, garden) add what you interact with. Anything that collides
 * lives inside <Physics>.
 */
export function Scene() {
  return (
    <>
      <Sky />
      <Lights />
      <Physics>
        <Diorama />
        <Panda />
        <Room />
        <Laptop />
        <VinylCorner />
        <Garden />
      </Physics>
      <Zones />
      <FollowCamera />
      <Effects />
    </>
  )
}
