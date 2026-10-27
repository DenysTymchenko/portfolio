import { useMemo } from 'react'
import { useDiorama } from '../../hooks/useDiorama'
import { useAppState } from '../../state/appState'
import { Zone } from './Zone'
import { ZonePrompt } from './ZonePrompt'

/** Garden area: from the partition wall to the fence, front to back of the island. */
const GARDEN_SIZE: [number, number] = [5.7, 7.8]

/** The three points of interest, plus the prompt for whichever one the panda is in. */
export function Zones() {
  const { point } = useDiorama()
  const centers = useMemo(
    () => ({ desk: point('Zone_Desk'), vinyl: point('Zone_Vinyl'), garden: point('Zone_Garden') }),
    [point],
  )
  const zone = useAppState((s) => s.zone)
  const seated = useAppState((s) => s.seated)
  return (
    <>
      <Zone id="desk" center={centers.desk} radius={1.1} />
      <Zone id="vinyl" center={centers.vinyl} radius={1.3} />
      <Zone id="garden" center={centers.garden} size={GARDEN_SIZE} />
      {zone && !seated && <ZonePrompt key={zone} zone={zone} />}
    </>
  )
}
