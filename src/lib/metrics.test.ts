import { describe, expect, it } from 'vitest'
import {
  bestPaceForActivity,
  bestSetForExercise,
  consistencyGrid,
  contributingExercises,
  daysAgo,
  daysSinceLastWorked,
  decayedMuscleVolume,
  e1rmHistory,
  horseTally,
  leastLoadedMuscles,
  loadForSet,
  loggedCardioActivities,
  loggedExerciseIds,
  muscleFatigue,
  muscleVolumeForSession,
  muscleVolumeInWindow,
  paceForSession,
  paceHistory,
  sessionLoad,
  sessionsInRange,
  startOfWeek,
  weeklyChukkas,
  weeklyDistance,
  weeklyLoad,
} from './metrics'
import type {
  CardioSession,
  Exercise,
  LiftSession,
  MuscleId,
  PoloSession,
  Session,
} from '../types'
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

  it('doubles volume for a unilateral set, to account for both sides', () => {
    const session: LiftSession = {
      id: '1',
      date: '2026-08-19',
      type: 'lift',
      sets: [
        { exerciseId: 'barbell_bench_press', weightKg: 60, reps: 8, unilateral: true },
      ],
    }
    const totals = muscleVolumeForSession(session, exercises, 75)
    // 60kg x 8 reps x 2 sides = 960 volume
    expect(totals.chest).toBe(960)
    expect(totals.triceps).toBe(480)
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

describe('decayedMuscleVolume', () => {
  it('applies no decay to a session logged today', () => {
    const session: LiftSession = {
      id: '1',
      date: '2026-08-19',
      type: 'lift',
      sets: [{ exerciseId: 'barbell_bench_press', weightKg: 60, reps: 8 }],
    }
    const decayed = decayedMuscleVolume([session], exercises, 75, '2026-08-19')
    expect(decayed.chest).toBeCloseTo(480)
  })

  it('applies exponential decay based on days ago (half-life 2.5 days)', () => {
    const session: LiftSession = {
      id: '1',
      date: '2026-08-14', // 5 days before reference
      type: 'lift',
      sets: [{ exerciseId: 'barbell_bench_press', weightKg: 60, reps: 8 }],
    }
    const decayed = decayedMuscleVolume([session], exercises, 75, '2026-08-19')
    // 480 * e^(-5/2.5) = 480 * e^-2
    expect(decayed.chest).toBeCloseTo(480 * Math.exp(-2))
  })

  it('ignores sessions outside the 10-day lookback', () => {
    const session: LiftSession = {
      id: '1',
      date: '2026-08-01', // well over 10 days ago
      type: 'lift',
      sets: [{ exerciseId: 'barbell_bench_press', weightKg: 60, reps: 8 }],
    }
    const decayed = decayedMuscleVolume([session], exercises, 75, '2026-08-19')
    expect(decayed.chest).toBe(0)
  })
})

describe('muscleFatigue', () => {
  it('is 0 for every muscle when there are no sessions', () => {
    const fatigue = muscleFatigue([], exercises, 75, '2026-08-19')
    expect(fatigue.chest).toBe(0)
  })

  it('is 1 for a muscle whose only session is today (today is necessarily its own peak)', () => {
    const session: LiftSession = {
      id: '1',
      date: '2026-08-19',
      type: 'lift',
      sets: [{ exerciseId: 'barbell_bench_press', weightKg: 60, reps: 8 }],
    }
    const fatigue = muscleFatigue([session], exercises, 75, '2026-08-19')
    expect(fatigue.chest).toBeCloseTo(1)
  })

  it('reads lower for a muscle worked longer ago than one worked recently', () => {
    const recent: LiftSession = {
      id: '1',
      date: '2026-08-18',
      type: 'lift',
      sets: [{ exerciseId: 'dips', weightKg: 0, reps: 10 }], // hits triceps
    }
    const stale: LiftSession = {
      id: '2',
      date: '2026-07-20', // outside the fatigue lookback, but still within the 8-week peak window
      type: 'lift',
      sets: [{ exerciseId: 'dips', weightKg: 0, reps: 10 }],
    }
    const fatigue = muscleFatigue([recent, stale], exercises, 75, '2026-08-19')
    // recent was worked yesterday (still decaying); stale was worked weeks ago so its
    // decayed contribution today is ~0, but it set the 8-week peak, so the ratio is < 1
    expect(fatigue.triceps).toBeGreaterThan(0)
    expect(fatigue.triceps).toBeLessThan(1)
  })
})

describe('daysSinceLastWorked', () => {
  it('is undefined when the muscle has never been worked', () => {
    expect(daysSinceLastWorked([], exercises, 75, 'chest', '2026-08-19')).toBeUndefined()
  })

  it('is 0 for a muscle worked today', () => {
    const session: LiftSession = {
      id: '1',
      date: '2026-08-19',
      type: 'lift',
      sets: [{ exerciseId: 'barbell_bench_press', weightKg: 60, reps: 8 }],
    }
    expect(daysSinceLastWorked([session], exercises, 75, 'chest', '2026-08-19')).toBe(0)
  })

  it('finds the most recent session that actually touches the muscle', () => {
    const old: LiftSession = {
      id: '1',
      date: '2026-08-05',
      type: 'lift',
      sets: [{ exerciseId: 'barbell_bench_press', weightKg: 60, reps: 8 }], // chest
    }
    const recentLegs: LiftSession = {
      id: '2',
      date: '2026-08-18',
      type: 'lift',
      sets: [{ exerciseId: 'dips', weightKg: 0, reps: 10 }], // triceps/chest, not legs
    }
    expect(
      daysSinceLastWorked([old, recentLegs], exercises, 75, 'chest', '2026-08-19'),
    ).toBe(1) // recentLegs (dips) also hits chest, 1 day ago
  })
})

describe('contributingExercises', () => {
  it('sums volume per exercise for the given muscle and sorts descending', () => {
    const session: LiftSession = {
      id: '1',
      date: '2026-08-19',
      type: 'lift',
      sets: [
        { exerciseId: 'barbell_bench_press', weightKg: 60, reps: 8 }, // chest volume 480
        { exerciseId: 'dips', weightKg: 10, reps: 10 }, // chest volume 850*0.8=680
      ],
    }
    const result = contributingExercises([session], exercises, 75, 'chest', 28, '2026-08-19')
    expect(result).toEqual([
      { exerciseId: 'dips', volume: 680 },
      { exerciseId: 'barbell_bench_press', volume: 480 },
    ])
  })

  it('excludes exercises that do not touch the muscle', () => {
    const session: LiftSession = {
      id: '1',
      date: '2026-08-19',
      type: 'lift',
      sets: [{ exerciseId: 'barbell_bench_press', weightKg: 60, reps: 8 }],
    }
    const result = contributingExercises([session], exercises, 75, 'quads', 28, '2026-08-19')
    expect(result).toEqual([])
  })
})

describe('e1rmHistory', () => {
  it('takes the best e1RM per session, in date order', () => {
    const sessions: LiftSession[] = [
      {
        id: '1',
        date: '2026-08-10',
        type: 'lift',
        sets: [
          { exerciseId: 'barbell_bench_press', weightKg: 60, reps: 5 },
          { exerciseId: 'barbell_bench_press', weightKg: 65, reps: 3 }, // heavier e1RM
        ],
      },
      {
        id: '2',
        date: '2026-08-17',
        type: 'lift',
        sets: [{ exerciseId: 'barbell_bench_press', weightKg: 70, reps: 3 }],
      },
    ]
    const history = e1rmHistory(sessions, exercises, 75, 'barbell_bench_press')
    expect(history).toHaveLength(2)
    expect(history[0].date).toBe('2026-08-10')
    // 65 * (1 + 3/30) = 71.5, beats 60 * (1 + 5/30) = 70
    expect(history[0].e1rm).toBeCloseTo(71.5)
    expect(history[1].date).toBe('2026-08-17')
    expect(history[1].e1rm).toBeCloseTo(70 * (1 + 3 / 30))
  })

  it('is empty for an exercise that was never logged', () => {
    expect(e1rmHistory([], exercises, 75, 'barbell_bench_press')).toEqual([])
  })
})

describe('bestSetForExercise', () => {
  it('finds the highest-e1RM set across all sessions', () => {
    const sessions: LiftSession[] = [
      {
        id: '1',
        date: '2026-08-10',
        type: 'lift',
        sets: [{ exerciseId: 'barbell_bench_press', weightKg: 60, reps: 8 }],
      },
      {
        id: '2',
        date: '2026-08-17',
        type: 'lift',
        sets: [{ exerciseId: 'barbell_bench_press', weightKg: 80, reps: 2 }],
      },
    ]
    const best = bestSetForExercise(sessions, exercises, 75, 'barbell_bench_press')
    expect(best?.date).toBe('2026-08-17')
    expect(best?.weightKg).toBe(80)
  })

  it('never doubles a unilateral set -- e1RM/PRs track the actual per-side weight', () => {
    const sessions: LiftSession[] = [
      {
        id: '1',
        date: '2026-08-10',
        type: 'lift',
        sets: [
          { exerciseId: 'barbell_bench_press', weightKg: 15, reps: 10, unilateral: true },
        ],
      },
    ]
    const best = bestSetForExercise(sessions, exercises, 75, 'barbell_bench_press')
    expect(best?.weightKg).toBe(15)
    expect(best?.e1rm).toBeCloseTo(15 * (1 + 10 / 30))
  })
})

describe('loggedExerciseIds', () => {
  it('collects distinct exercise ids from lift sessions only', () => {
    const sessions: LiftSession[] = [
      {
        id: '1',
        date: '2026-08-10',
        type: 'lift',
        sets: [
          { exerciseId: 'barbell_bench_press', weightKg: 60, reps: 8 },
          { exerciseId: 'dips', weightKg: 0, reps: 10 },
          { exerciseId: 'barbell_bench_press', weightKg: 60, reps: 6 },
        ],
      },
    ]
    expect(loggedExerciseIds(sessions).sort()).toEqual(['barbell_bench_press', 'dips'])
  })
})

describe('weeklyLoad', () => {
  it('buckets sessions into Monday-start weeks and sums sRPE load', () => {
    const sessions: Session[] = [
      { id: '1', date: '2026-08-19', type: 'cardio', activity: 'run', durationMin: 30, rpe: 6 },
    ]
    const weeks = weeklyLoad(sessions, '2026-08-19', 3)
    expect(weeks).toHaveLength(3)
    expect(weeks[2].load).toBe(180) // this week: 30 * 6
    expect(weeks[0].load).toBe(0)
    expect(weeks[1].load).toBe(0)
  })
})

describe('consistencyGrid', () => {
  it('returns weeks * 7 days ending in the current week, marking session types per day', () => {
    const sessions: Session[] = [
      { id: '1', date: '2026-08-19', type: 'lift', sets: [] },
      { id: '2', date: '2026-08-19', type: 'cardio', activity: 'run', durationMin: 20 },
    ]
    const grid = consistencyGrid(sessions, '2026-08-19', 2)
    expect(grid).toHaveLength(14)
    const today = grid.find((d) => d.date === '2026-08-19')
    expect(today?.types.sort()).toEqual(['cardio', 'lift'])
    const untouched = grid.find((d) => d.date !== '2026-08-19')
    expect(untouched?.types).toEqual([])
  })
})

describe('paceForSession', () => {
  const base = { id: '1', date: '2026-08-19', type: 'cardio' as const, durationMin: 60 }

  it('is min/km for a run', () => {
    const session: CardioSession = { ...base, activity: 'run', distanceKm: 10 }
    expect(paceForSession(session)).toBeCloseTo(6)
  })

  it('is min/100m for a swim', () => {
    const session: CardioSession = { ...base, activity: 'swim', distanceKm: 2, durationMin: 40 }
    // 2km = 20x100m, 40min / 20 = 2 min/100m
    expect(paceForSession(session)).toBeCloseTo(2)
  })

  it('is km/h for a cycle', () => {
    const session: CardioSession = { ...base, activity: 'cycle', distanceKm: 30, durationMin: 60 }
    expect(paceForSession(session)).toBeCloseTo(30)
  })

  it('is undefined without a distance', () => {
    const session: CardioSession = { ...base, activity: 'run' }
    expect(paceForSession(session)).toBeUndefined()
  })
})

describe('paceHistory', () => {
  it('only includes the given activity, sorted by date, ignoring sessions with no distance', () => {
    const sessions: Session[] = [
      { id: '1', date: '2026-08-10', type: 'cardio', activity: 'run', durationMin: 60, distanceKm: 10 },
      { id: '2', date: '2026-08-05', type: 'cardio', activity: 'run', durationMin: 30 }, // no distance
      { id: '3', date: '2026-08-12', type: 'cardio', activity: 'swim', durationMin: 40, distanceKm: 2 },
    ]
    const history = paceHistory(sessions, 'run')
    expect(history).toHaveLength(1)
    expect(history[0].date).toBe('2026-08-10')
  })
})

describe('bestPaceForActivity', () => {
  it('picks the lowest pace (fastest) for a run', () => {
    const sessions: CardioSession[] = [
      { id: '1', date: '2026-08-10', type: 'cardio', activity: 'run', durationMin: 60, distanceKm: 10 }, // 6 min/km
      { id: '2', date: '2026-08-17', type: 'cardio', activity: 'run', durationMin: 50, distanceKm: 10 }, // 5 min/km, faster
    ]
    const best = bestPaceForActivity(sessions, 'run')
    expect(best?.date).toBe('2026-08-17')
  })

  it('picks the highest speed (fastest) for a cycle', () => {
    const sessions: CardioSession[] = [
      { id: '1', date: '2026-08-10', type: 'cardio', activity: 'cycle', durationMin: 60, distanceKm: 25 },
      { id: '2', date: '2026-08-17', type: 'cardio', activity: 'cycle', durationMin: 60, distanceKm: 30 },
    ]
    const best = bestPaceForActivity(sessions, 'cycle')
    expect(best?.date).toBe('2026-08-17')
  })

  it('is undefined when the activity was never logged with a distance', () => {
    expect(bestPaceForActivity([], 'run')).toBeUndefined()
  })
})

describe('loggedCardioActivities', () => {
  it('collects distinct activities from cardio sessions only', () => {
    const sessions: Session[] = [
      { id: '1', date: '2026-08-10', type: 'cardio', activity: 'run', durationMin: 30 },
      { id: '2', date: '2026-08-11', type: 'cardio', activity: 'run', durationMin: 30 },
      { id: '3', date: '2026-08-12', type: 'cardio', activity: 'swim', durationMin: 30 },
    ]
    expect(loggedCardioActivities(sessions).sort()).toEqual(['run', 'swim'])
  })
})

describe('weeklyDistance', () => {
  it('sums distance for one activity within each week', () => {
    const sessions: CardioSession[] = [
      { id: '1', date: '2026-08-19', type: 'cardio', activity: 'run', durationMin: 30, distanceKm: 5 },
      { id: '2', date: '2026-08-19', type: 'cardio', activity: 'swim', durationMin: 30, distanceKm: 1 },
    ]
    const weeks = weeklyDistance(sessions, 'run', '2026-08-19', 2)
    expect(weeks[1].distanceKm).toBe(5)
  })
})

describe('weeklyChukkas', () => {
  it('sums chukkas per week', () => {
    const sessions: PoloSession[] = [
      { id: '1', date: '2026-08-19', type: 'polo', chukkas: 4, durationMin: 30, horses: [] },
      { id: '2', date: '2026-08-18', type: 'polo', chukkas: 3, durationMin: 22.5, horses: [] },
    ]
    const weeks = weeklyChukkas(sessions, '2026-08-19', 1)
    expect(weeks[0].chukkas).toBe(7)
  })
})

describe('horseTally', () => {
  it('counts sessions per horse, descending', () => {
    const sessions: PoloSession[] = [
      { id: '1', date: '2026-08-10', type: 'polo', chukkas: 4, durationMin: 30, horses: ['Song', 'Trillion'] },
      { id: '2', date: '2026-08-17', type: 'polo', chukkas: 4, durationMin: 30, horses: ['Song'] },
    ]
    expect(horseTally(sessions)).toEqual([
      { horse: 'Song', count: 2 },
      { horse: 'Trillion', count: 1 },
    ])
  })
})
