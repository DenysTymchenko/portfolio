import { Loader } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useRef } from 'react'
import { experience } from './data/experience'
import { profile } from './data/profile'
import { projects } from './data/projects'
import { Scene } from './scene/Scene'
import { useAppState } from './state/appState'
import { bindInput, input } from './utils/input'

/** Joystick ring shown while dragging to walk (mostly for touch screens). */
function DragKnob() {
  const ring = useRef<HTMLDivElement>(null!)
  const knob = useRef<HTMLDivElement>(null!)
  useEffect(() => {
    let frame = 0
    const tick = () => {
      if (!ring.current || !knob.current) return // unmounted between frames
      const d = input.drag
      ring.current.style.opacity = d?.active ? '1' : '0'
      if (d?.active) {
        const dx = d.x - d.x0
        const dy = d.y - d.y0
        const len = Math.min(1, 70 / Math.max(1, Math.hypot(dx, dy)))
        ring.current.style.transform = `translate(${d.x0}px, ${d.y0}px)`
        knob.current.style.transform = `translate(${dx * len}px, ${dy * len}px)`
      }
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [])
  return (
    <div ref={ring} className="drag-ring" aria-hidden>
      <div ref={knob} className="drag-knob" />
    </div>
  )
}

/** The same content as plain HTML, for screen readers and search engines. */
function SrContent() {
  return (
    <main className="sr-only">
      <h1>
        {profile.name}, {profile.role}
      </h1>
      <p>{profile.summary}</p>
      <ul>
        {profile.contacts.map((c) => (
          <li key={c.label}>
            <a href={c.href}>{c.label}</a>
          </li>
        ))}
      </ul>
      <h2>Projects</h2>
      {projects.map((p) => (
        <section key={p.id}>
          <h3>{p.title}</h3>
          <p>{p.summary}</p>
        </section>
      ))}
      <h2>Experience</h2>
      {experience.map((j) => (
        <section key={j.id}>
          <h3>
            {j.role}, {j.company} ({j.period})
          </h3>
          <ul>
            {j.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  )
}

export default function App() {
  const stage = useRef<HTMLDivElement>(null!)
  useEffect(
    () =>
      bindInput(stage.current, {
        interact: () => useAppState.getState().interact(),
        exit: () => useAppState.getState().stand(),
      }),
    [],
  )
  return (
    <>
      <div ref={stage} className="stage">
        <Canvas
          shadows="percentage"
          dpr={[1, 2]}
          camera={{ fov: 35, near: 0.05, far: 200, position: [6, 16, 32] }}
          onCreated={(state) => {
            if (import.meta.env.DEV) Object.assign(window, { __three: state })
          }}
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
        <DragKnob />
      </div>
      <SrContent />
      <Loader />
    </>
  )
}
