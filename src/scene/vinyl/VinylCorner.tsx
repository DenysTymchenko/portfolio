import { useMemo } from 'react'
import { projects } from '../../data/projects'
import { useDiorama } from '../../hooks/useDiorama'
import { useAppState } from '../../state/appState'
import { PlayingRecord } from './PlayingRecord'
import { ProjectBoard } from './ProjectBoard'
import { RecordSleeve } from './RecordSleeve'

const CUBBIES = 8 // the cabinet has 8 cubbies (Anchor_Cubby_0..7), one record each

/** The record cabinet (one sleeve per project), the turntable and the "Now playing" board. */
export function VinylCorner() {
  const { point } = useDiorama()
  const projectId = useAppState((s) => s.projectId)
  const playing = projects.find((p) => p.id === projectId)
  const cubbies = useMemo(() => projects.slice(0, CUBBIES).map((_, i) => point(`Anchor_Cubby_${i}`)), [point])
  const standAt = useMemo(() => point('Zone_Vinyl'), [point])
  return (
    <>
      {cubbies.map((cubby, i) => (
        <RecordSleeve key={projects[i].id} project={projects[i]} cubby={cubby} standAt={standAt} />
      ))}
      {playing && <PlayingRecord key={playing.id} project={playing} />}
      <ProjectBoard />
    </>
  )
}
