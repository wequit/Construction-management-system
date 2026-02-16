import type { RoadmapEdge } from '../types'

export function pointOnSide(x: number, y: number, w: number, h: number, side: string) {
  const topAndBottomX = x + (w / 2)
  const rightX = x + w
  const leftX = x

  const rightAndLeftY = y + (h / 2)
  const topY = y
  const bottomY = y + h

  if (side === 'top') return { x: topAndBottomX, y: topY }
  if (side === 'right') return { x: rightX, y: rightAndLeftY }
  if (side === 'bottom') return { x: topAndBottomX, y: bottomY }
  return { x: leftX, y: rightAndLeftY }
}

export function pointOnSideOffset(x: number, y: number, side: string) {
  const offset = 15
  if (side === 'top') return { x, y: y - offset }
  if (side === 'right') return { x: x + offset, y }
  if (side === 'bottom') return { x, y: y + offset }
  return { x: x - offset, y }
}

export function initEdges(_: { from: string, to: string, fromSide: string, toSide: string }): RoadmapEdge[] {
  return [
    { from: `${_.from}_anchor_${_.fromSide}`, to: `${_.from}_offset_${_.fromSide}`, type: 'start' },
    { from: `${_.from}_offset_${_.fromSide}`, to: `${_.to}_offset_${_.toSide}`, type: 'mid' },
    { from: `${_.to}_offset_${_.toSide}`, to: `${_.to}_anchor_${_.toSide}`, type: 'finish' },
  ]
}
