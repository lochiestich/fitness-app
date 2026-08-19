import type { Exercise, ExerciseCategory, MuscleId } from '../types'

export const MUSCLE_IDS: MuscleId[] = [
  'chest',
  'front_delts',
  'side_delts',
  'rear_delts',
  'lats',
  'upper_back',
  'biceps',
  'triceps',
  'forearms',
  'core',
  'lower_back',
  'glutes',
  'quads',
  'hamstrings',
  'calves',
]

export const MUSCLE_LABELS: Record<MuscleId, string> = {
  chest: 'Chest',
  front_delts: 'Front Delts',
  side_delts: 'Side Delts',
  rear_delts: 'Rear Delts',
  lats: 'Lats',
  upper_back: 'Upper Back',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  core: 'Core',
  lower_back: 'Lower Back',
  glutes: 'Glutes',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  calves: 'Calves',
}

const MUSCLE_TO_CATEGORY: Record<MuscleId, ExerciseCategory> = {
  chest: 'push',
  front_delts: 'push',
  side_delts: 'push',
  triceps: 'push',
  rear_delts: 'pull',
  lats: 'pull',
  upper_back: 'pull',
  biceps: 'pull',
  forearms: 'pull',
  lower_back: 'core',
  core: 'core',
  glutes: 'legs',
  quads: 'legs',
  hamstrings: 'legs',
  calves: 'legs',
}

export function categoryForMuscle(muscle: MuscleId): ExerciseCategory {
  return MUSCLE_TO_CATEGORY[muscle]
}

export function primaryMuscle(exercise: Exercise): MuscleId | undefined {
  let best: MuscleId | undefined
  let bestValue = -Infinity
  for (const id of MUSCLE_IDS) {
    const value = exercise.muscles[id]
    if (value !== undefined && value > bestValue) {
      bestValue = value
      best = id
    }
  }
  return best
}
