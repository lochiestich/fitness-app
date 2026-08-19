import { MUSCLE_IDS } from './muscles'
import type {
  CardioActivity,
  CardioSession,
  Exercise,
  LiftSession,
  MuscleId,
  PoloSession,
  Session,
} from '../types'

const LIFT_SET_DURATION_ESTIMATE_MIN = 2.5
const FATIGUE_LOOKBACK_DAYS = 10
const FATIGUE_HALF_LIFE_DAYS = 2.5
const FATIGUE_PEAK_WINDOW_DAYS = 56

export function toLocalDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function daysAgo(dateStr: string, referenceDateStr: string): number {
  const a = new Date(`${dateStr}T00:00:00`)
  const b = new Date(`${referenceDateStr}T00:00:00`)
  return Math.round((b.getTime() - a.getTime()) / 86_400_000)
}

export function startOfWeek(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`)
  const day = d.getDay()
  const diff = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - diff)
  return toLocalDateString(d)
}

export function addDays(dateStr: string, delta: number): string {
  const d = new Date(`${dateStr}T00:00:00`)
  d.setDate(d.getDate() + delta)
  return toLocalDateString(d)
}

export function loadForSet(
  weightKg: number,
  bodyweight: boolean,
  bodyweightKg: number,
): number {
  return bodyweight ? bodyweightKg + weightKg : weightKg
}

export function sessionLoad(session: Session): number {
  if (session.rpe === undefined) return 0
  const duration =
    session.type === 'lift'
      ? (session.durationMin ?? session.sets.length * LIFT_SET_DURATION_ESTIMATE_MIN)
      : session.durationMin
  return duration * session.rpe
}

export function muscleVolumeForSession(
  session: LiftSession,
  exercises: Exercise[],
  bodyweightKg: number,
): Partial<Record<MuscleId, number>> {
  const totals: Partial<Record<MuscleId, number>> = {}
  for (const set of session.sets) {
    const exercise = exercises.find((e) => e.id === set.exerciseId)
    if (!exercise) continue
    const load = loadForSet(set.weightKg, exercise.bodyweight, bodyweightKg)
    const volume = load * set.reps
    for (const [muscle, factor] of Object.entries(exercise.muscles)) {
      const id = muscle as MuscleId
      totals[id] = (totals[id] ?? 0) + volume * (factor ?? 0)
    }
  }
  return totals
}

export function muscleVolumeInWindow(
  sessions: Session[],
  exercises: Exercise[],
  bodyweightKg: number,
  days: number,
  referenceDate: string,
): Record<MuscleId, number> {
  const totals = Object.fromEntries(MUSCLE_IDS.map((m) => [m, 0])) as Record<
    MuscleId,
    number
  >
  for (const session of sessions) {
    if (session.type !== 'lift') continue
    const age = daysAgo(session.date, referenceDate)
    if (age < 0 || age >= days) continue
    const sessionTotals = muscleVolumeForSession(session, exercises, bodyweightKg)
    for (const [muscle, value] of Object.entries(sessionTotals)) {
      totals[muscle as MuscleId] += value ?? 0
    }
  }
  return totals
}

export function leastLoadedMuscles(
  volumeByMuscle: Record<MuscleId, number>,
  count: number,
): MuscleId[] {
  return [...MUSCLE_IDS]
    .sort((a, b) => volumeByMuscle[a] - volumeByMuscle[b])
    .slice(0, count)
}

export function decayedMuscleVolume(
  sessions: Session[],
  exercises: Exercise[],
  bodyweightKg: number,
  referenceDate: string,
): Record<MuscleId, number> {
  const totals = Object.fromEntries(MUSCLE_IDS.map((m) => [m, 0])) as Record<
    MuscleId,
    number
  >
  for (const session of sessions) {
    if (session.type !== 'lift') continue
    const age = daysAgo(session.date, referenceDate)
    if (age < 0 || age >= FATIGUE_LOOKBACK_DAYS) continue
    const decay = Math.exp(-age / FATIGUE_HALF_LIFE_DAYS)
    const sessionTotals = muscleVolumeForSession(session, exercises, bodyweightKg)
    for (const [muscle, value] of Object.entries(sessionTotals)) {
      totals[muscle as MuscleId] += (value ?? 0) * decay
    }
  }
  return totals
}

export function muscleFatigue(
  sessions: Session[],
  exercises: Exercise[],
  bodyweightKg: number,
  referenceDate: string,
): Record<MuscleId, number> {
  const current = decayedMuscleVolume(sessions, exercises, bodyweightKg, referenceDate)
  const peak = Object.fromEntries(MUSCLE_IDS.map((m) => [m, 0])) as Record<
    MuscleId,
    number
  >
  for (let d = 0; d < FATIGUE_PEAK_WINDOW_DAYS; d++) {
    const date = addDays(referenceDate, -d)
    const decayed = decayedMuscleVolume(sessions, exercises, bodyweightKg, date)
    for (const m of MUSCLE_IDS) {
      if (decayed[m] > peak[m]) peak[m] = decayed[m]
    }
  }
  const fatigue = Object.fromEntries(MUSCLE_IDS.map((m) => [m, 0])) as Record<
    MuscleId,
    number
  >
  for (const m of MUSCLE_IDS) {
    fatigue[m] = peak[m] > 0 ? Math.min(1, current[m] / peak[m]) : 0
  }
  return fatigue
}

export function daysSinceLastWorked(
  sessions: Session[],
  exercises: Exercise[],
  bodyweightKg: number,
  muscle: MuscleId,
  referenceDate: string,
): number | undefined {
  let min: number | undefined
  for (const session of sessions) {
    if (session.type !== 'lift') continue
    const age = daysAgo(session.date, referenceDate)
    if (age < 0) continue
    const totals = muscleVolumeForSession(session, exercises, bodyweightKg)
    if ((totals[muscle] ?? 0) <= 0) continue
    if (min === undefined || age < min) min = age
  }
  return min
}

export function contributingExercises(
  sessions: Session[],
  exercises: Exercise[],
  bodyweightKg: number,
  muscle: MuscleId,
  days: number,
  referenceDate: string,
): { exerciseId: string; volume: number }[] {
  const totals = new Map<string, number>()
  for (const session of sessions) {
    if (session.type !== 'lift') continue
    const age = daysAgo(session.date, referenceDate)
    if (age < 0 || age >= days) continue
    for (const set of session.sets) {
      const exercise = exercises.find((e) => e.id === set.exerciseId)
      if (!exercise) continue
      const factor = exercise.muscles[muscle]
      if (!factor) continue
      const load = loadForSet(set.weightKg, exercise.bodyweight, bodyweightKg)
      const volume = load * set.reps * factor
      totals.set(set.exerciseId, (totals.get(set.exerciseId) ?? 0) + volume)
    }
  }
  return [...totals.entries()]
    .map(([exerciseId, volume]) => ({ exerciseId, volume }))
    .sort((a, b) => b.volume - a.volume)
}

export function sessionsInRange(
  sessions: Session[],
  fromDate: string,
  toDate: string,
): Session[] {
  return sessions.filter((s) => s.date >= fromDate && s.date <= toDate)
}

function sortByDateAsc<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
}

export function e1rm(loadKg: number, reps: number): number {
  return loadKg * (1 + reps / 30)
}

export function bestE1rmForSession(
  session: LiftSession,
  exerciseId: string,
  exercise: Exercise,
  bodyweightKg: number,
): number | undefined {
  let best: number | undefined
  for (const set of session.sets) {
    if (set.exerciseId !== exerciseId) continue
    const load = loadForSet(set.weightKg, exercise.bodyweight, bodyweightKg)
    const value = e1rm(load, set.reps)
    if (best === undefined || value > best) best = value
  }
  return best
}

export function e1rmHistory(
  sessions: Session[],
  exercises: Exercise[],
  bodyweightKg: number,
  exerciseId: string,
): { date: string; e1rm: number }[] {
  const exercise = exercises.find((e) => e.id === exerciseId)
  if (!exercise) return []
  const points: { date: string; e1rm: number }[] = []
  for (const session of sessions) {
    if (session.type !== 'lift') continue
    const best = bestE1rmForSession(session, exerciseId, exercise, bodyweightKg)
    if (best !== undefined) points.push({ date: session.date, e1rm: best })
  }
  return sortByDateAsc(points)
}

export type BestSet = { date: string; weightKg: number; reps: number; e1rm: number }

export function bestSetForExercise(
  sessions: Session[],
  exercises: Exercise[],
  bodyweightKg: number,
  exerciseId: string,
): BestSet | undefined {
  const exercise = exercises.find((e) => e.id === exerciseId)
  if (!exercise) return undefined
  let best: BestSet | undefined
  for (const session of sessions) {
    if (session.type !== 'lift') continue
    for (const set of session.sets) {
      if (set.exerciseId !== exerciseId) continue
      const load = loadForSet(set.weightKg, exercise.bodyweight, bodyweightKg)
      const value = e1rm(load, set.reps)
      if (!best || value > best.e1rm) {
        best = { date: session.date, weightKg: set.weightKg, reps: set.reps, e1rm: value }
      }
    }
  }
  return best
}

export function loggedExerciseIds(sessions: Session[]): string[] {
  const ids = new Set<string>()
  for (const s of sessions) {
    if (s.type === 'lift') s.sets.forEach((set) => ids.add(set.exerciseId))
  }
  return [...ids]
}

export function weeklyLoad(
  sessions: Session[],
  referenceDate: string,
  weeks: number,
): { weekStart: string; load: number }[] {
  const currentWeekStart = startOfWeek(referenceDate)
  const result: { weekStart: string; load: number }[] = []
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = addDays(currentWeekStart, -7 * i)
    const weekEnd = addDays(weekStart, 6)
    const load = sessionsInRange(sessions, weekStart, weekEnd).reduce(
      (sum, s) => sum + sessionLoad(s),
      0,
    )
    result.push({ weekStart, load: Math.round(load) })
  }
  return result
}

export function consistencyGrid(
  sessions: Session[],
  referenceDate: string,
  weeks: number,
): { date: string; types: Session['type'][] }[] {
  const currentWeekStart = startOfWeek(referenceDate)
  const start = addDays(currentWeekStart, -7 * (weeks - 1))
  const days: { date: string; types: Session['type'][] }[] = []
  for (let i = 0; i < weeks * 7; i++) {
    const date = addDays(start, i)
    const types = [...new Set(sessions.filter((s) => s.date === date).map((s) => s.type))]
    days.push({ date, types })
  }
  return days
}

export function paceForSession(session: CardioSession): number | undefined {
  if (!session.distanceKm || session.distanceKm <= 0) return undefined
  switch (session.activity) {
    case 'run':
    case 'walk':
      return session.durationMin / session.distanceKm // min/km
    case 'swim':
      return session.durationMin / (session.distanceKm * 10) // min/100m
    case 'cycle':
    case 'row':
      return session.distanceKm / (session.durationMin / 60) // km/h
    default:
      return undefined
  }
}

export function paceHistory(
  sessions: Session[],
  activity: CardioActivity,
): { date: string; pace: number }[] {
  const points = sessions
    .filter((s): s is CardioSession => s.type === 'cardio' && s.activity === activity)
    .map((s) => ({ date: s.date, pace: paceForSession(s) }))
    .filter((p): p is { date: string; pace: number } => p.pace !== undefined)
  return sortByDateAsc(points)
}

const HIGHER_PACE_IS_BETTER: CardioActivity[] = ['cycle', 'row']

export function bestPaceForActivity(
  sessions: Session[],
  activity: CardioActivity,
): { date: string; pace: number } | undefined {
  const history = paceHistory(sessions, activity)
  if (history.length === 0) return undefined
  const higherIsBetter = HIGHER_PACE_IS_BETTER.includes(activity)
  return history.reduce((best, cur) =>
    higherIsBetter
      ? cur.pace > best.pace
        ? cur
        : best
      : cur.pace < best.pace
        ? cur
        : best,
  )
}

export function loggedCardioActivities(sessions: Session[]): CardioActivity[] {
  const activities = new Set<CardioActivity>()
  for (const s of sessions) {
    if (s.type === 'cardio') activities.add(s.activity)
  }
  return [...activities]
}

export function weeklyDistance(
  sessions: Session[],
  activity: CardioActivity,
  referenceDate: string,
  weeks: number,
): { weekStart: string; distanceKm: number }[] {
  const currentWeekStart = startOfWeek(referenceDate)
  const result: { weekStart: string; distanceKm: number }[] = []
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = addDays(currentWeekStart, -7 * i)
    const weekEnd = addDays(weekStart, 6)
    const distanceKm = sessionsInRange(sessions, weekStart, weekEnd)
      .filter((s): s is CardioSession => s.type === 'cardio' && s.activity === activity)
      .reduce((sum, s) => sum + (s.distanceKm ?? 0), 0)
    result.push({ weekStart, distanceKm: Math.round(distanceKm * 10) / 10 })
  }
  return result
}

export function weeklyChukkas(
  sessions: Session[],
  referenceDate: string,
  weeks: number,
): { weekStart: string; chukkas: number }[] {
  const currentWeekStart = startOfWeek(referenceDate)
  const result: { weekStart: string; chukkas: number }[] = []
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = addDays(currentWeekStart, -7 * i)
    const weekEnd = addDays(weekStart, 6)
    const chukkas = sessionsInRange(sessions, weekStart, weekEnd)
      .filter((s): s is PoloSession => s.type === 'polo')
      .reduce((sum, s) => sum + s.chukkas, 0)
    result.push({ weekStart, chukkas })
  }
  return result
}

export function horseTally(sessions: Session[]): { horse: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const session of sessions) {
    if (session.type !== 'polo') continue
    for (const horse of session.horses) {
      counts.set(horse, (counts.get(horse) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([horse, count]) => ({ horse, count }))
    .sort((a, b) => b.count - a.count)
}
