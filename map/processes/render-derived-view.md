---
type: process
status: verified
universe: live
consumes: ["../objects/data-model/db.md", "../objects/metrics/metrics.md", "../objects/body-map/body-regions.md"]
produces: []
---

# render-derived-view

The read path every screen except the raw log forms follows: load the persisted tree, run it through pure calculation functions, hand the result to components as props. Nothing this process produces is ever written back — that's the whole point of it.

## Input → Movement → Output

A screen mounts, calls `store.loadDB()` once, and passes the result (plus a reference date, almost always `todayLocalDate()`) into one or more `metrics.ts` functions. The output is plain data — numbers, records keyed by `MuscleId`, arrays of chart points — that flows straight into JSX. No caching layer, no memoized derived state in `DB`.

## Why this shape

CLAUDE.md hard rule: "Never write a derived value into the store." The cost of always recomputing is a few dozen array passes over what's realistically a few hundred sessions at most — cheap enough that the simplicity of "never a stale derived number" wins outright. This is also why `metrics.ts` has no React import (`objects/metrics/metrics.md`): keeping it framework-free is what makes "just call it again" free of hook-ordering or effect-dependency concerns.

## Steps

1. Screen component calls `loadDB()` and `allExercises(db)` — `src/screens/Body.tsx:9-13` is a representative example
2. Screen calls the specific `metrics.ts` function(s) it needs, e.g. `muscleFatigue(sessions, exercises, bodyweightKg, today)` for the Body screen, `weeklyLoad`/`consistencyGrid`/`e1rmHistory` for Progress, `leastLoadedMuscles` for Today
3. Result is passed as props into presentational components (`BodyMap`, `MuscleScores`, `VolumeBars`, the `progress/*` chart components) — none of them call `loadDB()` themselves, they only receive already-derived data
4. `BodyMap` specifically maps `muscleFatigue()`'s per-`MuscleId` output through `bodyRegions.ts`'s region list (averaging where a region covers more than one muscle — the Shoulders case) before choosing a fill color — `src/components/BodyMap.tsx`

## If you change this

- **Hits:** whatever screen you're editing, obviously — but also every *other* screen if the change is inside a shared `metrics.ts` function (e.g. editing `sessionLoad` affects both Today's streak/goals and Progress's weekly-load chart)
- **Does not hit:** `DB`'s persisted shape — this process is read-only by construction, so a bug here shows a wrong number, it can't corrupt what's saved

## Surfaces

| Surface | Role |
|---|---|
| every screen except the log forms | runs this on mount |
| `src/lib/store.ts` | supplies the raw `DB` this process starts from |
| `src/lib/metrics.ts` | does all the actual computation |

## See

- Objects: `../objects/data-model/db.md`, `../objects/metrics/metrics.md`, `../objects/body-map/body-regions.md`
- Source: `src/screens/Body.tsx` (representative), `src/lib/metrics.ts`
