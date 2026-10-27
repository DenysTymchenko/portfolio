import { Physics } from '@react-three/rapier'
import { Laptop } from './desk/Laptop'
import { Diorama } from './Diorama'
import { Effects } from './Effects'
import { FollowCamera } from './FollowCamera'
import { Garden } from './garden/Garden'
import { Lights } from './Lights'
import { Panda } from './panda/Panda'
import { Room } from './room/Room'
import { Sky } from './sky/Sky'
import { VinylCorner } from './vinyl/VinylCorner'
import { Zones } from './zones/Zones'

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
