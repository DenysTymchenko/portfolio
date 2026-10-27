import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { experience } from '../../data/experience'
import { useDiorama } from '../../hooks/useDiorama'
import { useAppState } from '../../state/appState'
import { panda } from '../../state/pandaState'
import { TEXT_COLORS } from '../../utils/colors'
import { FloorText } from '../shared/FloorText'
import { AppleTree } from './AppleTree'
import { BeachBall } from './BeachBall'
import { Fireflies } from './Fireflies'
import { JobBoard } from './JobBoard'

const SHAKE_REACH = 2.6 // E / tap shakes the nearest tree within this distance

/** Which tree to shake, and a counter so the same tree can be shaken again. */
interface IShakeOrder {
  tree: number
  signal: number
}

/**
 * The apple garden. Every Tree_N_Canopy in the diorama is an apple tree, and the jobs from
 * data/experience are dealt out between the trees like cards (job 1 → tree 1, job 2 → tree 2…).
 */
export function Garden() {
  const { find } = useDiorama()
  const canopies = useMemo(() => find(/^Tree_\d+_Canopy$/), [find])
  const jobsPerTree = useMemo(
    () => canopies.map((_, tree) => experience.filter((_, job) => job % canopies.length === tree)),
    [canopies],
  )
  const shakeRequest = useAppState((s) => s.shakeRequest)
  const [shakeOrder, setShakeOrder] = useState<IShakeOrder>({ tree: -1, signal: 0 })

  // "Interact" in the garden: shake whichever tree the panda is nearest to.
  useEffect(() => {
    if (!shakeRequest) return
    const at = new THREE.Vector3()
    let nearest = -1
    let nearestDistance = SHAKE_REACH
    canopies.forEach((canopy, i) => {
      canopy.getWorldPosition(at)
      const distance = Math.hypot(panda.position.x - at.x, panda.position.z - at.z)
      if (distance < nearestDistance) [nearest, nearestDistance] = [i, distance]
    })
    if (nearest >= 0) setShakeOrder({ tree: nearest, signal: shakeRequest })
  }, [shakeRequest, canopies])

  return (
    <>
      {canopies.map((canopy, i) => (
        <AppleTree
          key={canopy.name}
          canopy={canopy}
          jobs={jobsPerTree[i]}
          shakeSignal={shakeOrder.tree === i ? shakeOrder.signal : 0}
        />
      ))}
      <JobBoard />
      <BeachBall />
      <Fireflies />
      <FloorText
        anchor="Anchor_HintGarden"
        text={'Every apple is a job I had.\nBump into a tree to shake one loose.'}
        color={TEXT_COLORS.grassPaint}
        opacity={0.85}
        size={0.15}
      />
    </>
  )
}
