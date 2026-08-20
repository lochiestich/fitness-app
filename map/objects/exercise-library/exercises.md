---
type: object
cluster: exercise-library
universe: live
status: verified
entity: src/data/exercises.json
---

# exercise-library (seed exercises + muscle groups)

The seed exercise catalog (`exercises.json`) and the muscle-grouping logic layered on top of it (`muscles.ts`) — everything the Log screen's exercise picker needs to search, browse, and categorize.

## Why this shape

The seed library is a flat JSON array, not code, so it can be extended without touching TypeScript — each entry is an `Exercise` (see `objects/data-model/db.md`) with a hand-tuned muscle-weighting map (SPEC.md §2: 1.0 = prime mover, 0.5 = meaningful assistance, 0.3 = real but minor — a training heuristic, not biomechanics). `muscles.ts` sits between this data and the UI: it derives a `push/pull/legs/core` category per muscle, a `BroadGroupId` browse grouping, and `primaryMuscle()` (highest-weighted muscle, used to file a custom exercise into a browse group). None of this is persisted — `BroadGroupId` and category are computed on the fly, never stored on an `Exercise`.

## Shape

- `exercises.json` — 47 seed exercises, each `{ id, name, category, bodyweight, muscles: {...weights} }` — `src/data/exercises.json`
- `horses.json` — separate seed list, a roster of horse names for the Polo form's chip picker (unrelated to muscles, lives in the same `data/` folder because it's the app's only other seed data) — `src/data/horses.json`
- `MUSCLE_IDS` / `MUSCLE_LABELS` — the 16 fixed IDs and their display labels — `src/lib/muscles.ts:3-39`
- `BROAD_GROUPS` — the exercise picker's browse categories: Chest, Shoulders, Back (includes Traps), Biceps, Triceps, Forearms, Legs, Core — `src/lib/muscles.ts:74-82`. Each group lists which `MuscleId`s it covers; `broadGroupForMuscle()` looks up a muscle's group. `traps` and `upper_back` both browse under Back even though they're separate body-map regions (see `objects/body-map/body-regions.md`) — there's no dedicated Traps browse button.
- `primaryMuscle(exercise)` — highest-weighted muscle in an `Exercise.muscles` map, used to sort a newly-added custom exercise into the right browse group (and, since this session, to derive a multi-muscle custom exercise's `category`) — `src/lib/muscles.ts:89-99`

## Connected to

- **owns:** nothing persisted — this is reference data merged at read time
- **owned-by:** `objects/store/store.md`'s `allExercises()` merges this seed array with `db.customExercises`
- **joins:** `objects/data-model/db.md` (`Exercise`/`MuscleId` types this data is shaped by), `src/components/ExercisePicker.tsx` (the only consumer of `BROAD_GROUPS`)
- **looks-like-but-is-not:** a persisted grouping — `BroadGroupId` never appears in `DB`; an `Exercise` only ever stores its `muscles` weighting map, the group is inferred from that every time the picker renders

## If you change this

- **Hits:** `ExercisePicker.tsx`'s browse buttons and per-group exercise lists, any custom exercise's auto-filed browse group (via `primaryMuscle`)
- **Does not hit:** `DB` schema, saved sessions — `LiftSet.exerciseId` just references an id string; regrouping or re-weighting an exercise doesn't rewrite history, but it does change how already-logged sessions' volume splits on the next read (since `metrics.ts` re-derives volume from the *current* `muscles` map, not a snapshot)

## Surfaces

| Surface | Role |
|---|---|
| `src/components/ExercisePicker.tsx` | reads (search, browse-by-group, "+ Add exercise" default) |
| `src/lib/store.ts` (`allExercises`) | reads, merges with custom exercises |
| `src/lib/metrics.ts` | reads each exercise's `muscles` map for every volume/e1RM calculation |

## See

- Source: `src/data/exercises.json`, `src/data/horses.json`, `src/lib/muscles.ts`
- Spec: repo-root `SPEC.md` §2 (muscle weighting maps)
