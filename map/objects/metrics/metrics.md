---
type: object
cluster: metrics
universe: live
status: verified
entity: src/lib/metrics.ts
---

# metrics

Every derived number in the app — volume, e1RM, session load, muscle fatigue, pace — as ~40 pure functions. No React import, no `localStorage` access; everything here takes plain data in and returns plain data out.

## Why this shape

CLAUDE.md hard rule: "Never write a derived value into the store." Fatigue, volume, e1RM, and pace are recomputed from raw `Session[]`/`Exercise[]` on every read, never cached in `DB`. That's why this file has no side effects — a pure function is the only shape that makes "always recompute, never trust a stale stored number" cheap to keep true. Being pure and React-free is also what makes it directly unit-testable (`metrics.test.ts`, 44 tests) without mounting a component — CLAUDE.md calls this out explicitly as where the bugs will actually be (volume splitting and e1RM).

## Shape

Grouped by what they compute, not file order:

- **Dates:** `toLocalDateString`, `daysAgo`, `startOfWeek`, `addDays` — `src/lib/metrics.ts:17-42`
- **Volume:** `loadForSet` (bodyweight + added load), `sessionLoad` (sRPE = duration × RPE), `muscleVolumeForSession` (splits one session's volume across muscles by weighting map), `muscleVolumeInWindow`, `leastLoadedMuscles` — `src/lib/metrics.ts:44-110`
- **Fatigue (feeds the Body screen):** `decayedMuscleVolume` (exponential decay, half-life `FATIGUE_HALF_LIFE_DAYS`, lookback `FATIGUE_LOOKBACK_DAYS`), `muscleFatigue` (normalizes decayed volume against that muscle's own rolling peak over `FATIGUE_PEAK_WINDOW_DAYS` — per-muscle, not global, so quads don't always read hot) — `src/lib/metrics.ts:112-160`, formula in SPEC.md §5
- **e1RM (feeds Progress):** `e1rm` (Epley), `bestE1rmForSession`, `e1rmHistory`, `bestSetForExercise` — `src/lib/metrics.ts:222-283`
- **Cardio/pace:** `paceForSession`, `paceHistory`, `bestPaceForActivity`, `weeklyDistance` — `src/lib/metrics.ts:327-400`
- **Polo:** `weeklyChukkas`, `horseTally` — `src/lib/metrics.ts:401-419` (no pace/distance concept applies — SPEC.md §6)
- **Rollups:** `weeklyLoad`, `consistencyGrid`, `sessionsInRange`, `contributingExercises`, `daysSinceLastWorked` — used by Today and Progress

## Connected to

- **owns:** nothing persisted — every return value is recomputed, never the source of truth for anything
- **owned-by:** nothing calls into this to mutate state; it's read-only by construction
- **joins:** `objects/data-model/db.md` (input shape), `objects/body-map/body-regions.md` (consumes `muscleFatigue`'s output keyed by `MuscleId`)
- **looks-like-but-is-not:** `store.ts` — see that card's collision note

## If you change this

- **Hits:** the Body screen (fatigue → body map colors + Load score list), Progress (e1RM/pace/consistency charts, PRs), Today (streak bar, goals widget, least-loaded sentence) — anywhere a derived number is displayed
- **Does not hit:** `DB`'s shape or anything in `store.ts` — this file never writes, so a bug here can produce a wrong number on screen but can't corrupt persisted state

## Surfaces

| Surface | Role |
|---|---|
| every screen except raw log forms | reads (calls one or more of these functions on mount) |
| `src/lib/metrics.test.ts` | the only writer of expectations about this file's behavior |
| `objects/body-map/body-regions.md` | reads `muscleFatigue`'s output to color the SVG |

## See

- Source: `src/lib/metrics.ts`
- Tests: `src/lib/metrics.test.ts`
- Spec: repo-root `SPEC.md` §5 ("Derived numbers") — the formulas live there, not here
