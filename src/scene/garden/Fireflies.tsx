import { useFrame, useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'

const COUNT = 36
// Garden volume (three.js coords: x right, y up, z towards the camera).
const AREA = { x: [1.6, 6.6], y: [0.3, 2.2], z: [-3.2, 3.0] }

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  attribute float aSeed;
  varying float vAlpha;
  void main() {
    float t = uTime * 0.4 + aSeed;
    vec3 p = position + vec3(sin(t * 1.3) * 0.35, sin(t * 0.9) * 0.25, cos(t * 1.1) * 0.35);
    vec4 view = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * view;
    gl_PointSize = uSize / -view.z;
    vAlpha = 0.25 + 0.75 * pow(0.5 + 0.5 * sin(uTime * 2.0 + aSeed * 3.0), 3.0);
  }
`
const fragmentShader = /* glsl */ `
  varying float vAlpha;
  void main() {
    float glow = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5));
    gl_FragColor = vec4(vec3(1.0, 0.86, 0.45) * 3.0, glow * vAlpha); // > 1 so the bloom catches it
  }
`

/** Fireflies drifting and blinking over the garden. */
export function Fireflies() {
  const dpr = useThree((s) => s.viewport.dpr)
  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const seeds = new Float32Array(COUNT)
    const between = ([a, b]: number[]) => a + Math.random() * (b - a)
    for (let i = 0; i < COUNT; i++) {
      positions.set([between(AREA.x), between(AREA.y), between(AREA.z)], i * 3)
      seeds[i] = Math.random() * 100
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    const material = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uSize: { value: 0 } },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    return { geometry, material }
  }, [])
  material.uniforms.uSize.value = 90 * dpr

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime
  })
  return <points geometry={geometry} material={material} frustumCulled={false} />
}
