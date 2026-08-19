import type { MuscleId } from '../types'

export type RegionShape = { x: number; y: number; w: number; h: number; rx: number }

export type BodyRegion = { muscle: MuscleId; shapes: RegionShape[] }

export const FRONT_VIEWBOX_HEIGHT = 160
export const BACK_VIEWBOX_HEIGHT = 190

export const FRONT_REGIONS: BodyRegion[] = [
  {
    muscle: 'side_delts',
    shapes: [
      { x: 12, y: 28, w: 14, h: 8, rx: 4 },
      { x: 74, y: 28, w: 14, h: 8, rx: 4 },
    ],
  },
  {
    muscle: 'front_delts',
    shapes: [
      { x: 14, y: 36, w: 14, h: 10, rx: 3 },
      { x: 72, y: 36, w: 14, h: 10, rx: 3 },
    ],
  },
  { muscle: 'chest', shapes: [{ x: 32, y: 40, w: 36, h: 24, rx: 6 }] },
  {
    muscle: 'biceps',
    shapes: [
      { x: 6, y: 48, w: 12, h: 26, rx: 5 },
      { x: 82, y: 48, w: 12, h: 26, rx: 5 },
    ],
  },
  {
    muscle: 'forearms',
    shapes: [
      { x: 4, y: 76, w: 11, h: 28, rx: 5 },
      { x: 85, y: 76, w: 11, h: 28, rx: 5 },
    ],
  },
  { muscle: 'core', shapes: [{ x: 36, y: 66, w: 28, h: 30, rx: 6 }] },
  {
    muscle: 'quads',
    shapes: [
      { x: 30, y: 100, w: 17, h: 50, rx: 6 },
      { x: 53, y: 100, w: 17, h: 50, rx: 6 },
    ],
  },
]

export const BACK_REGIONS: BodyRegion[] = [
  {
    muscle: 'rear_delts',
    shapes: [
      { x: 12, y: 28, w: 14, h: 8, rx: 4 },
      { x: 74, y: 28, w: 14, h: 8, rx: 4 },
    ],
  },
  { muscle: 'upper_back', shapes: [{ x: 30, y: 36, w: 40, h: 20, rx: 6 }] },
  {
    muscle: 'triceps',
    shapes: [
      { x: 4, y: 48, w: 12, h: 26, rx: 5 },
      { x: 84, y: 48, w: 12, h: 26, rx: 5 },
    ],
  },
  {
    muscle: 'lats',
    shapes: [
      { x: 22, y: 54, w: 20, h: 24, rx: 6 },
      { x: 58, y: 54, w: 20, h: 24, rx: 6 },
    ],
  },
  { muscle: 'lower_back', shapes: [{ x: 36, y: 76, w: 28, h: 16, rx: 6 }] },
  { muscle: 'glutes', shapes: [{ x: 32, y: 94, w: 36, h: 20, rx: 8 }] },
  {
    muscle: 'hamstrings',
    shapes: [
      { x: 30, y: 116, w: 17, h: 34, rx: 6 },
      { x: 53, y: 116, w: 17, h: 34, rx: 6 },
    ],
  },
  {
    muscle: 'calves',
    shapes: [
      { x: 30, y: 152, w: 17, h: 30, rx: 6 },
      { x: 53, y: 152, w: 17, h: 30, rx: 6 },
    ],
  },
]
