import { Text } from '@react-three/drei'
import { useState } from 'react'

/** One paragraph in a TextColumn. */
export interface ITextBlock {
  text: string
  font: string
  size: number
  color: string
  /** Space below the block, in metres. */
  gap?: number
  lineHeight?: number
  spacing?: number
}

interface ITextColumnProps {
  blocks: ITextBlock[]
  left: number
  top: number
  width: number
}

/** The part of troika's text mesh that onSync gives us: [minX, minY, maxX, maxY]. */
interface ISyncedText {
  textRenderInfo?: { blockBounds: [number, number, number, number] }
}

/**
 * 3D text blocks stacked top-down at their measured heights (troika reports them on sync),
 * so wrapped titles and long summaries never overlap whatever comes next.
 */
export function TextColumn({ blocks, left, top, width }: ITextColumnProps) {
  const [heights, setHeights] = useState<number[]>([])
  let y = top
  return blocks.map((block, i) => {
    const at = y
    y -= (heights[i] ?? block.size * 1.3) + (block.gap ?? 0.05)
    return (
      <Text
        key={i}
        font={block.font}
        fontSize={block.size}
        lineHeight={block.lineHeight ?? 1.25}
        letterSpacing={block.spacing ?? 0}
        color={block.color}
        anchorX="left"
        anchorY="top"
        maxWidth={width}
        position={[left, at, 0]}
        onSync={(mesh: ISyncedText) => {
          const bounds = mesh.textRenderInfo?.blockBounds
          if (!bounds) return
          const h = bounds[3] - bounds[1]
          setHeights((hs) => (Math.abs((hs[i] ?? 0) - h) < 1e-4 ? hs : Object.assign([...hs], { [i]: h })))
        }}
      >
        {block.text}
      </Text>
    )
  })
}
