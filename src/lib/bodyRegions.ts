import type { MuscleId } from '../types'

export type RegionShape = { x: number; y: number; w: number; h: number }

export type BodyRegion = {
  id: string
  label: string
  muscles: MuscleId[]
  shapes: RegionShape[]
}

export const FRONT_VIEWBOX_HEIGHT = 160
export const BACK_VIEWBOX_HEIGHT = 210

// Regions are laid out so that any two whose x-ranges overlap keep at least a
// 2-unit y gap between them (and vice versa) -- BodyMap pads each shape's hit
// area by 1 unit for touch, so a 2-unit real gap keeps hit areas from ever
// overlapping and stealing taps meant for a neighbour.

export const FRONT_REGIONS: BodyRegion[] = [
  {
    id: 'shoulders_front',
    label: 'Shoulders',
    muscles: ['front_delts', 'side_delts'],
    shapes: [
      { x: 10, y: 28, w: 18, h: 18 },
      { x: 72, y: 28, w: 18, h: 18 },
    ],
  },
  {
    id: 'chest',
    label: 'Chest',
    muscles: ['chest'],
    shapes: [{ x: 28, y: 38, w: 44, h: 26 }],
  },
  {
    id: 'biceps',
    label: 'Biceps',
    muscles: ['biceps'],
    shapes: [
      { x: 4, y: 48, w: 13, h: 26 },
      { x: 83, y: 48, w: 13, h: 26 },
    ],
  },
  {
    id: 'forearms',
    label: 'Forearms',
    muscles: ['forearms'],
    shapes: [
      { x: 4, y: 76, w: 11, h: 28 },
      { x: 85, y: 76, w: 11, h: 28 },
    ],
  },
  {
    id: 'core',
    label: 'Core',
    muscles: ['core'],
    shapes: [{ x: 34, y: 66, w: 32, h: 30 }],
  },
  {
    id: 'quads',
    label: 'Quads',
    muscles: ['quads'],
    shapes: [
      { x: 29, y: 98, w: 18, h: 52 },
      { x: 53, y: 98, w: 18, h: 52 },
    ],
  },
]

export const BACK_REGIONS: BodyRegion[] = [
  {
    id: 'shoulders_back',
    label: 'Rear Delts',
    muscles: ['rear_delts'],
    shapes: [
      { x: 10, y: 28, w: 18, h: 18 },
      { x: 72, y: 28, w: 18, h: 18 },
    ],
  },
  {
    id: 'upper_back',
    label: 'Upper Back',
    muscles: ['upper_back'],
    shapes: [{ x: 28, y: 38, w: 44, h: 22 }],
  },
  {
    id: 'triceps',
    label: 'Triceps',
    muscles: ['triceps'],
    shapes: [
      { x: 4, y: 48, w: 13, h: 26 },
      { x: 83, y: 48, w: 13, h: 26 },
    ],
  },
  {
    id: 'lats',
    label: 'Lats',
    muscles: ['lats'],
    shapes: [
      { x: 20, y: 62, w: 22, h: 26 },
      { x: 58, y: 62, w: 22, h: 26 },
    ],
  },
  {
    id: 'lower_back',
    label: 'Lower Back',
    muscles: ['lower_back'],
    shapes: [{ x: 34, y: 90, w: 32, h: 18 }],
  },
  {
    id: 'glutes',
    label: 'Glutes',
    muscles: ['glutes'],
    shapes: [{ x: 30, y: 110, w: 40, h: 22 }],
  },
  {
    id: 'hamstrings',
    label: 'Hamstrings',
    muscles: ['hamstrings'],
    shapes: [
      { x: 29, y: 134, w: 18, h: 36 },
      { x: 53, y: 134, w: 18, h: 36 },
    ],
  },
  {
    id: 'calves',
    label: 'Calves',
    muscles: ['calves'],
    shapes: [
      { x: 29, y: 172, w: 18, h: 32 },
      { x: 53, y: 172, w: 18, h: 32 },
    ],
  },
]
