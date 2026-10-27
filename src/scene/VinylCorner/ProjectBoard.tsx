import { projects } from '../../data/projects'
import { useAppState } from '../../state/appState'
import { TEXT_COLORS } from '../../utils/colors'
import { FONT_BOLD, FONT_REGULAR } from '../../utils/fonts'
import { IS_TOUCH } from '../../utils/input'
import { Anchored } from '../shared/Anchored'
import { TextColumn, type ITextBlock } from '../shared/TextColumn'
import { TextLink } from '../shared/TextLink'

/** The cork board above the cabinet: details of the record on the turntable. */
export function ProjectBoard() {
  const projectId = useAppState((s) => s.projectId)
  const project = projects.find((p) => p.id === projectId)
  const { ink, brown } = TEXT_COLORS
  const blocks: ITextBlock[] = project
    ? [
        { text: 'NOW PLAYING', font: FONT_BOLD, size: 0.06, color: brown, spacing: 0.1, gap: 0.03 },
        { text: project.title, font: FONT_BOLD, size: 0.15, color: ink },
        { text: [project.year, ...project.stack].join('  ·  '), font: FONT_BOLD, size: 0.06, color: brown, gap: 0.07 },
        { text: project.summary, font: FONT_REGULAR, size: 0.07, color: ink, lineHeight: 1.4 },
      ]
    : [
        { text: 'RECORDS', font: FONT_BOLD, size: 0.06, color: brown, spacing: 0.1, gap: 0.03 },
        { text: 'Every record is a project', font: FONT_BOLD, size: 0.15, color: ink, gap: 0.08 },
        {
          text: IS_TOUCH ? 'Tap a record in the cabinet to play it.' : 'Click a record in the cabinet, or stand next to it and press E.',
          font: FONT_REGULAR,
          size: 0.075,
          color: ink,
          lineHeight: 1.4,
        },
      ]
  return (
    <Anchored to="Anchor_ProjectBoard">
      <group position-z={0.004}>
        <TextColumn blocks={blocks} left={-0.88} top={0.57} width={1.76} />
        {project?.links.map((link, i) => (
          <TextLink key={link.label} href={link.href} label={link.label} position={[-0.88 + i * 0.45, -0.47, 0]} />
        ))}
      </group>
    </Anchored>
  )
}
