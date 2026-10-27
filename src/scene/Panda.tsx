import type { KinematicCharacterController } from '@dimforge/rapier3d-compat'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { CapsuleCollider, RigidBody, useRapier, type RapierCollider, type RapierRigidBody } from '@react-three/rapier'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useDiorama } from '../hooks/useDiorama'
import { useAppState } from '../state/appState'
import { panda } from '../state/pandaState'
import { input, isRunning, readMove } from '../utils/input'
import { stylize } from '../utils/materials'

const PANDA_URL = '/models/panda.glb'
const RADIUS = 0.3
const HALF = 0.18 // capsule half-height; total height 2 * (HALF + RADIUS) ≈ 0.96 m
const WALK = 2.4
const RUN = 4.2
const GRAVITY = 22
const JUMP = 6.5
const FALL_LIMIT = -8 // below this the panda respawns on the rug

function dampAngle(from: number, to: number, lambda: number, dt: number) {
  const delta = Math.atan2(Math.sin(to - from), Math.cos(to - from))
  return from + delta * (1 - Math.exp(-lambda * dt))
}

/**
 * The red panda you control. Movement goes through Rapier's kinematic character controller
 * (slides along walls, climbs small steps, pushes dynamic props). The model is rigid parts
 * pivoting at their joints (blender/scripts/build_panda.py), animated procedurally here.
 */
export function Panda() {
  const { scene, nodes } = useGLTF(PANDA_URL)
  const diorama = useDiorama()
  const { world } = useRapier()
  const body = useRef<RapierRigidBody>(null!)
  const collider = useRef<RapierCollider>(null!)
  const facing = useRef<THREE.Group>(null!)
  const bob = useRef<THREE.Group>(null!)
  const controller = useRef<KinematicCharacterController | null>(null)

  const spots = useMemo(
    () => ({ spawn: diorama.point('Spot_Rug'), chair: diorama.point('Spot_Chair'), desk: diorama.point('Spot_Desk') }),
    [diorama],
  )
  const sim = useRef({
    vel: new THREE.Vector3(),
    vy: 0,
    grounded: false,
    yaw: 0,
    phase: 0,
    walk: 0,
    sit: 0,
    air: 0,
    wave: 0,
    waveUntil: 0,
    idleFor: 0,
    stuckFor: 0,
    seated: false,
    zone: null as string | null,
  })
  const tmp = useMemo(() => ({ move: new THREE.Vector2(), fwd: new THREE.Vector3(), right: new THREE.Vector3(), wish: new THREE.Vector3() }), [])

  useEffect(() => {
    const c = world.createCharacterController(0.02)
    c.enableAutostep(0.25, 0.15, false)
    c.enableSnapToGround(0.3)
    c.setMaxSlopeClimbAngle(0.9)
    c.setApplyImpulsesToDynamicBodies(true)
    c.setCharacterMass(30)
    controller.current = c
    return () => {
      controller.current = null
      world.removeCharacterController(c)
    }
  }, [world])

  useLayoutEffect(() => {
    stylize(scene)
    scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) o.castShadow = true
    })
    panda.position.copy(spots.spawn)
  }, [scene, spots])

  useFrame((state, delta) => {
    const c = controller.current
    const rb = body.current
    if (!c || !rb) return
    const dt = Math.min(delta, 1 / 20)
    const t = state.clock.elapsedTime
    const s = sim.current
    const store = useAppState.getState()
    const move = readMove(tmp.move)
    const hasInput = move.lengthSq() > 0.01
    if (hasInput || input.jumpQueued) {
      store.start()
      panda.walkTarget = null
      panda.onArrive = null
      if (store.seated) store.stand()
    }

    // Sitting down / standing up teleports between the chair and the spot beside it.
    if (store.seated !== s.seated) {
      s.seated = store.seated
      const to = s.seated ? spots.chair : spots.desk
      rb.setNextKinematicTranslation(to)
      panda.position.copy(to)
      s.vel.set(0, 0, 0)
      s.vy = 0
    }
    if (store.zone !== s.zone) {
      if (store.zone && store.zone !== 'desk') s.waveUntil = t + 1.6
      s.zone = store.zone
    }

    let speed = 0
    if (s.seated) {
      s.yaw = dampAngle(s.yaw, Math.PI, 10, dt) // face the desk
    } else {
      // Camera-relative direction on the ground plane.
      state.camera.getWorldDirection(tmp.fwd)
      tmp.fwd.y = 0
      tmp.fwd.normalize()
      tmp.right.crossVectors(tmp.fwd, THREE.Object3D.DEFAULT_UP)
      const wish = tmp.wish.set(0, 0, 0)
      if (hasInput) {
        wish.addScaledVector(tmp.fwd, move.y).addScaledVector(tmp.right, move.x)
      } else if (panda.walkTarget) {
        wish.subVectors(panda.walkTarget, panda.position).setY(0)
        const dist = wish.length()
        if (dist < 0.15) {
          panda.walkTarget = null
          const arrive = panda.onArrive
          panda.onArrive = null
          arrive?.()
          wish.set(0, 0, 0)
        } else {
          wish.divideScalar(dist).multiplyScalar(Math.min(1, dist * 2))
        }
      }
      const top = isRunning() ? RUN : WALK
      s.vel.x = THREE.MathUtils.damp(s.vel.x, wish.x * top, 10, dt)
      s.vel.z = THREE.MathUtils.damp(s.vel.z, wish.z * top, 10, dt)

      if (input.jumpQueued && s.grounded) s.vy = JUMP
      input.jumpQueued = false
      s.vy -= GRAVITY * dt

      c.computeColliderMovement(collider.current, { x: s.vel.x * dt, y: s.vy * dt, z: s.vel.z * dt })
      const m = c.computedMovement()
      s.grounded = c.computedGrounded()
      if (s.grounded && s.vy < 0) s.vy = 0

      // Give up on a click-to-walk target if a wall keeps us from moving.
      const moved = Math.hypot(m.x, m.z)
      s.stuckFor = panda.walkTarget && moved < Math.hypot(s.vel.x, s.vel.z) * dt * 0.2 ? s.stuckFor + dt : 0
      if (s.stuckFor > 0.6) {
        panda.walkTarget = null
        panda.onArrive = null
      }

      const p = rb.translation()
      const next = { x: p.x + m.x, y: p.y + m.y, z: p.z + m.z }
      if (next.y < FALL_LIMIT) {
        Object.assign(next, spots.spawn)
        s.vy = 0
      }
      rb.setNextKinematicTranslation(next)
      panda.position.set(next.x, next.y, next.z)

      speed = Math.hypot(s.vel.x, s.vel.z)
      if (speed > 0.3) s.yaw = dampAngle(s.yaw, Math.atan2(s.vel.x, s.vel.z), 12, dt)
    }
    panda.velocity.set(s.vel.x, 0, s.vel.z)

    // --- procedural animation ------------------------------------------------------------
    s.idleFor = speed > 0.2 || hasInput ? 0 : s.idleFor + dt
    const stride = Math.min(1, speed / WALK)
    s.phase += dt * (5 + 7 * stride)
    s.walk = THREE.MathUtils.damp(s.walk, stride, 10, dt)
    s.sit = THREE.MathUtils.damp(s.sit, s.seated || s.idleFor > 14 ? 1 : 0, 6, dt)
    s.air = THREE.MathUtils.damp(s.air, !s.seated && !s.grounded ? 1 : 0, 12, dt)
    s.wave = THREE.MathUtils.damp(s.wave, t < s.waveUntil ? 1 : 0, 10, dt)

    const swing = Math.sin(s.phase) * 0.65 * s.walk * (1 - s.air)
    facing.current.rotation.y = s.yaw
    nodes.Panda_LegL.rotation.x = swing - 1.4 * s.sit - 0.5 * s.air
    nodes.Panda_LegR.rotation.x = -swing - 1.4 * s.sit + 0.3 * s.air
    nodes.Panda_ArmL.rotation.x = -swing * 0.8 - 0.6 * s.sit
    nodes.Panda_ArmR.rotation.x = swing * 0.8 - 0.6 * s.sit
    nodes.Panda_ArmL.rotation.z = 1.2 * s.air
    nodes.Panda_ArmR.rotation.z = -1.2 * s.air + s.wave * (-2.6 + Math.sin(t * 12) * 0.35)
    nodes.Panda_Head.rotation.z = Math.sin(t * 1.3) * 0.06 * (1 - s.walk)
    nodes.Panda_Head.rotation.x = Math.sin(t * 0.7) * 0.04 + 0.2 * s.sit * (s.seated ? 1 : 0)
    nodes.Panda_Tail.rotation.y = Math.sin(t * (2 + 7 * s.walk)) * (0.25 + 0.2 * s.walk)
    nodes.Panda_Tail.rotation.x = -0.4 * s.air
    bob.current.position.y = Math.abs(Math.sin(s.phase)) * 0.05 * s.walk - 0.22 * s.sit
    bob.current.scale.y = 1 + Math.sin(t * 2.2) * 0.012 * (1 - s.walk)
  })

  return (
    <RigidBody ref={body} type="kinematicPosition" colliders={false} position={spots.spawn} ccd>
      <CapsuleCollider ref={collider} args={[HALF, RADIUS]} position={[0, HALF + RADIUS, 0]} />
      <group ref={facing}>
        <group ref={bob}>
          <primitive object={scene} />
        </group>
      </group>
    </RigidBody>
  )
}

useGLTF.preload(PANDA_URL)
