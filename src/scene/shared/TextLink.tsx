import { Text, useCursor } from '@react-three/drei'
import { useState } from 'react'
import { TEXT_COLORS } from '../../utils/colors'
import { FONT_BOLD } from '../../utils/fonts'

interface ITextLinkProps {
  href: string
  label: string
  position: [number, number, number]
}

/** Clickable 3D text that opens a link in a new tab. */
export function TextLink({ href, label, position }: ITextLinkProps) {
  const [hover, setHover] = useState(false)
  useCursor(hover)
  return (
    <Text
      font={FONT_BOLD}
      fontSize={0.075}
      color={hover ? TEXT_COLORS.brown : TEXT_COLORS.red}
      anchorX="left"
      anchorY="top"
      position={position}
      onClick={(e) => {
        e.stopPropagation()
        window.open(href, '_blank', 'noopener')
      }}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      {label} ↗
    </Text>
  )
}
