import { describe, expect, it } from 'vitest'
import {
  daysAgo,
  leastLoadedMuscles,
  loadForSet,
  muscleVolumeForSession,
  muscleVolumeInWindow,
  sessionLoad,
  sessionsInRange,
  startOfWeek,
} from './metrics'
import type { Exercise, LiftSession, MuscleId } from '../types'
import { MUSCLE_IDS } from './muscles'

const benchPress: Exercise = {
  id: 'barbell_bench_press',
  name: 'Barbell Bench Press',
  category: 'push',
  bodyweight: false,
  muscles: { chest: 1.0, triceps: 0.5, front_delts: 0.4 },
}

const dips: Exercise = {
  id: 'dips',
  name: 'Dips',
  category: 'push',
  bodyweight: true,
  muscles: { triceps: 1.0, chest: 0.8, front_delts: 0.3 },
}

const exercises = [benchPress, dips]

const zeroVolume = () =>
  Object.fromEntries(MUSCLE_IDS.map((m) => [m, 0])) as Record<MuscleId, number>

describe('loadForSet', () => {
  it('uses raw weight for a non-bodyweight exercise', () => {
    expect(loadForSet(60, false, 75)).toBe(60)
  })

  it('adds bodyweight for a bodyweight exercise', () => {
    expect(loadForSet(10, true, 75)).toBe(85)
  })
})

describe('muscleVolumeForSession', () => {
  it('splits a single set of volume across its muscle weighting map', () => {
    const session: LiftSession = {
      id: '1',
      date: '2026-08-19',
      type: 'lift',
      sets: [{ exerciseId: 'barbell_bench_press', weightKg: 60, reps: 8 }],
    }
    const totals = muscleVolumeForSession(session, exercises, 75)
    // 60kg x 8 reps = 480 volume
    expect(totals.chest).toBe(480)
    expect(totals.triceps).toBe(240)
    expect(totals.front_delts).toBeCloseTo(192)
  })

  it('sums volume across multiple sets and exercises, including bodyweight load', () => {
    const session: LiftSession = {
      id: '1',
      date: '2026-08-19',
      type: 'lift',
      sets: [
        { exerciseId: 'barbell_bench_press', weightKg: 60, reps: 8 }, // 480 volume
        { exerciseId: 'dips', weightKg: 10, reps: 10 }, // load 85, volume 850
      ],
    }
    const totals = muscleVolumeForSession(session, exercises, 75)
    // chest: 480*1.0 + 850*0.8 = 480 + 680 = 1160
    expect(totals.chest).toBeCloseTo(1160)
    // triceps: 480*0.5 + 850*1.0 = 240 + 850 = 1090
    expect(totals.triceps).toBeCloseTo(1090)
  })

  it('ignores sets for exercises that cannot be found', () => {
    const session: LiftSession = {
      id: '1',
      date: '2026-08-19',
      type: 'lift',
      sets: [{ exerciseId: 'unknown_exercise', weightKg: 60, reps: 8 }],
    }
    const totals = muscleVolumeForSession(session, exercises, 75)
    expect(totals).toEqual({})
  })
})

describe('sessionLoad', () => {
  it('is durationMin x rpe when both are present', () => {
    expect(
      sessionLoad({
        id: '1',
        date: '2026-08-19',
        type: 'cardio',
        activity: 'run',
        durationMin: 60,
        rpe: 7,
      }),
    ).toBe(420)
  })

  it('estimates lift duration at 2.5 min per set when durationMin is missing', () => {
    const session: LiftSession = {
      id: '1',
      date: '2026-08-19',
      type: 'lift',
      rpe: 8,
      sets: [
        { exerciseId: 'a', weightKg: 1, reps: 1 },
        { exerciseId: 'a', weightKg: 1, reps: 1 },
        { exerciseId: 'a', weightKg: 1, reps: 1 },
        { exerciseId: 'a', weightKg: 1, reps: 1 },
      ],
    }
    // 4 sets x 2.5 min = 10 min, x rpe 8 = 80
    expect(sessionLoad(session)).toBe(80)
  })

  it('is 0 when rpe is missing, since load cannot be computed', () => {
    expect(
      sessionLoad({
        id: '1',
        date: '2026-08-19',
        type: 'polo',
        chukkas: 4,
        durationMin: 30,
        horses: [],
      }),
    ).toBe(0)
  })
})

describe('daysAgo', () => {
  it('is 0 for the same date', () => {
    expect(daysAgo('2026-08-19', '2026-08-19')).toBe(0)
  })

  it('counts whole days between two local dates', () => {
    expect(daysAgo('2026-08-10', '2026-08-19')).toBe(9)
  })
})

describe('muscleVolumeInWindow', () => {
  const session = (date: string): LiftSession => ({
    id: date,
    date,
    type: 'lift',
    sets: [{ exerciseId: 'barbell_bench_press', weightKg: 60, reps: 8 }],
  })

  it('includes a session exactly (days - 1) days ago and excludes one exactly `days` days ago', () => {
    const totals = muscleVolumeInWindow(
      [session('2026-08-10'), session('2026-08-09')],
      exercises,
      75,
      10,
      '2026-08-19',
    )
    // 2026-08-10 is 9 days ago (included, window is [0, 9]); 2026-08-09 is 10 days ago (excluded)
    expect(totals.chest).toBe(480)
  })

  it('returns all-zero totals for every muscle when nothing falls in the window', () => {
    const totals = muscleVolumeInWindow([], exercises, 75, 10, '2026-08-19')
    expect(totals).toEqual(zeroVolume())
  })
})

describe('leastLoadedMuscles', () => {
  it('ranks muscles ascending by volume', () => {
    const volumes = zeroVolume()
    for (const m of MUSCLE_IDS) volumes[m] = 100
    volumes.chest = 1000
    volumes.calves = 10
    volumes.rear_delts = 0
    const result = leastLoadedMuscles(volumes, 3)
    expect(result[0]).toBe('rear_delts')
    expect(result).not.toContain('chest')
    expect(result).toHaveLength(3)
  })
})

describe('sessionsInRange', () => {
  it('keeps sessions with a date inside the inclusive range', () => {
    const sessions: LiftSession[] = [
      { id: 'a', date: '2026-08-01', type: 'lift', sets: [] },
      { id: 'b', date: '2026-08-10', type: 'lift', sets: [] },
      { id: 'c', date: '2026-08-19', type: 'lift', sets: [] },
    ]
    const result = sessionsInRange(sessions, '2026-08-10', '2026-08-19')
    expect(result.map((s) => s.id)).toEqual(['b', 'c'])
  })
})

describe('startOfWeek', () => {
  it('returns a Monday on or before the given date, within the same 7-day span', () => {
    for (const date of ['2026-08-17', '2026-08-18', '2026-08-19', '2026-08-23']) {
      const start = startOfWeek(date)
      const startDay = new Date(`${start}T00:00:00`).getDay()
      expect(startDay).toBe(1) // Monday
      expect(start <= date).toBe(true)
      expect(daysAgo(start, date)).toBeLessThanOrEqual(6)
    }
  })
})
