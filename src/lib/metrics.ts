import { MUSCLE_IDS } from './muscles'
import type { Exercise, LiftSession, MuscleId, Session } from '../types'

const LIFT_SET_DURATION_ESTIMATE_MIN = 2.5

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

export function sessionsInRange(
  sessions: Session[],
  fromDate: string,
  toDate: string,
): Session[] {
  return sessions.filter((s) => s.date >= fromDate && s.date <= toDate)
}
