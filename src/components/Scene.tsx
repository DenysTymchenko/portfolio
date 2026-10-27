import { Apples } from './Apples'
import { CameraRig } from './CameraRig'
import { Panda } from './Panda'
import { PoiLabels } from './PoiLabels'
import { Records } from './Records'
import { Room } from './Room'
import { useRoom } from './useRoom'

/** Real-time lights for the grey-box. The art pass replaces most of this with baked lighting. */
function Lights() {
  const { point } = useRoom()
  return (
    <>
      <hemisphereLight args={['#ffe2bd', '#6b3420', 1.3]} />
      <directionalLight
        position={[-6, 12, 9]}
        intensity={2.2}
        color="#ffd6a3"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <pointLight position={point('Light_DeskLamp')} intensity={1.2} distance={3} color="#ffb85c" />
      <pointLight position={point('Light_FloorLamp')} intensity={3} distance={5} color="#ffb85c" />
      <pointLight position={point('Light_Window')} intensity={2} distance={4} color="#ffcf7a" />
    </>
  )
}

export function Scene() {
  return (
    <>
      <color attach="background" args={['#2b1813']} />
      <Lights />
      <Room />
      <Records />
      <Apples />
      <Panda />
      <PoiLabels />
      <CameraRig />
    </>
  )
}
