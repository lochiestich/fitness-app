export type MuscleId =
  | 'chest'
  | 'front_delts'
  | 'side_delts'
  | 'rear_delts'
  | 'lats'
  | 'upper_back'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'core'
  | 'lower_back'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'calves'

export type ExerciseCategory = 'push' | 'pull' | 'legs' | 'core'

export type Exercise = {
  id: string
  name: string
  category: ExerciseCategory
  bodyweight: boolean
  muscles: Partial<Record<MuscleId, number>>
}

export type LiftSet = {
  exerciseId: string
  weightKg: number
  reps: number
  rpe?: number
  supersetId?: string
  round?: number
  // Logged as one side at a time (e.g. dumbbell curls, single-leg extension).
  // weightKg/reps stay what was actually done on one side; volume-based stats
  // double it to represent both sides. Never doubled for e1RM/PRs -- see SPEC.md §5.
  unilateral?: boolean
}

export type CardioActivity = 'run' | 'swim' | 'cycle' | 'row' | 'walk' | 'other'

export type LiftSession = {
  id: string
  date: string
  type: 'lift'
  rpe?: number
  durationMin?: number
  notes?: string
  sets: LiftSet[]
}

export type CardioSession = {
  id: string
  date: string
  type: 'cardio'
  rpe?: number
  durationMin: number
  notes?: string
  activity: CardioActivity
  distanceKm?: number
}

export type PoloSession = {
  id: string
  date: string
  type: 'polo'
  rpe?: number
  durationMin: number
  notes?: string
  chukkas: number
  horses: string[]
}

export type Session = LiftSession | CardioSession | PoloSession

export type Settings = {
  bodyweightKg: number
  weeklySessionTarget: number
}

export type BodyweightLog = {
  date: string
  weightKg: number
}

export type DB = {
  version: 1
  settings: Settings
  customExercises: Exercise[]
  sessions: Session[]
  bodyweightLogs: BodyweightLog[]
}
