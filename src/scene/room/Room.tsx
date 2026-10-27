import { TEXT_COLORS } from '../../utils/colors'
import { IS_TOUCH } from '../../utils/input'
import { FloorText } from '../shared/FloorText'
import { CardboardBox, type ICardboardBoxProps } from './CardboardBox'
import { NameWall } from './NameWall'

const CONTROLS = IS_TOUCH
  ? 'DRAG  walk      PINCH  zoom\nTAP  things to use them'
  : 'WASD / ARROWS  walk      SHIFT  run      SPACE  jump\nE  interact      SCROLL  zoom      or click the floor to walk there'

/** A little stack by the garden door. */
const BOXES: ICardboardBoxProps[] = [
  { position: [0.25, 0.34, 2.65], size: 0.42, turn: 0.2 },
  { position: [0.3, 0.74, 2.62], size: 0.34, turn: -0.15 },
  { position: [-0.35, 0.3, 2.95], size: 0.34, turn: 0.6 },
]

/** Indoor bits that aren't a point of interest: name on the wall, controls on the floor, boxes. */
export function Room() {
  return (
    <>
      <NameWall />
      <FloorText anchor="Anchor_HintRoom" text={CONTROLS} color={TEXT_COLORS.floorPaint} opacity={0.55} size={0.16} />
      {BOXES.map((box, i) => (
        <CardboardBox key={i} {...box} />
      ))}
    </>
  )
}
