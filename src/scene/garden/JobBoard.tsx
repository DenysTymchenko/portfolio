import { experience } from '../../data/experience'
import { useAppState } from '../../state/appState'
import { TEXT_COLORS } from '../../utils/colors'
import { FONT_BOLD, FONT_REGULAR } from '../../utils/fonts'
import { Anchored } from '../shared/Anchored'
import { TextColumn, type ITextBlock } from '../shared/TextColumn'

/** The garden noticeboard: the job behind the apple that fell last. */
export function JobBoard() {
  const jobId = useAppState((s) => s.jobId)
  const job = experience.find((j) => j.id === jobId)
  const { ink, brown } = TEXT_COLORS
  const blocks: ITextBlock[] = job
    ? [
        { text: job.role, font: FONT_BOLD, size: 0.11, color: ink, gap: 0.03 },
        { text: [job.company, job.period, job.location].filter(Boolean).join('  ·  '), font: FONT_BOLD, size: 0.06, color: brown, gap: 0.07 },
        { text: job.highlights.map((h) => `•  ${h}`).join('\n'), font: FONT_REGULAR, size: 0.058, color: ink, lineHeight: 1.45 },
      ]
    : [
        { text: 'Experience', font: FONT_BOLD, size: 0.11, color: ink, gap: 0.03 },
        { text: `${experience.length} apples, ${experience.length} chapters`, font: FONT_BOLD, size: 0.06, color: brown, gap: 0.07 },
        { text: 'Shake a tree or click an apple — its story shows up here.', font: FONT_REGULAR, size: 0.06, color: ink, lineHeight: 1.45 },
      ]
  return (
    <Anchored to="Anchor_JobBoard">
      <group position-z={0.004}>
        <TextColumn blocks={blocks} left={-0.74} top={0.52} width={1.48} />
      </group>
    </Anchored>
  )
}
