import { Loader } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Overlay } from './components/Overlay'
import { Scene } from './components/Scene'

export default function App() {
  return (
    <>
      <Canvas shadows="percentage" dpr={[1, 2]} camera={{ fov: 35, near: 0.05, far: 200, position: [8, 18, 34] }}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <Overlay />
      <Loader />
    </>
  )
}
