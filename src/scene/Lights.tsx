import { useDiorama } from '../hooks/useDiorama'

/** Warm point lights at the lamp markers in the diorama: [marker, intensity, reach in metres]. */
const LAMPS: [string, number, number][] = [
  ['Light_FloorLamp', 4, 5],
  ['Light_DeskLamp', 1.6, 2.5],
  ['Light_Lantern_1', 3, 4],
  ['Light_Lantern_2', 3, 4],
]

/**
 * Summer evening, golden hour: a low warm sun from the front-right (long shadows, but still
 * reaching into the open side of the room) against a cool lavender sky fill, so shade stays
 * cool and the scene never goes uniformly yellow. Lamps and lanterns add warm pools of light.
 */
export function Lights() {
  const { point } = useDiorama()
  return (
    <>
      <hemisphereLight args={['#aab0f0', '#f6b083', 1.5]} />
      <directionalLight
        position={[10, 8, 12]}
        intensity={3.4}
        color="#ffb36b"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-near={1}
        shadow-camera-far={50}
        shadow-bias={-0.0005}
        shadow-normalBias={0.04}
        shadow-radius={3}
      />
      {LAMPS.map(([marker, intensity, distance]) => (
        <pointLight key={marker} position={point(marker)} intensity={intensity} distance={distance} color="#ffbe73" />
      ))}
    </>
  )
}
