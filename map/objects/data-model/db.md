---
type: object
cluster: data-model
universe: live
status: verified
entity: src/types.ts
---

# DB (and the types it's built from)

The whole app's persisted state, as one JSON-serializable tree — `DB`, plus every type it's made of (`Session`, `Exercise`, `LiftSet`, `Settings`, `BodyweightLog`, `MuscleId`). No separate product name; "the data model" is what people call this in conversation, `DB` is what the code calls it.

## Why this shape

Single blob, versioned, no relational joins, because the storage layer underneath is `localStorage` with no query engine (see `objects/store/store.md`) — everything that touches state loads the whole tree, mutates in memory, saves the whole tree back. `version: 1` exists so `loadDB` can detect a shape it doesn't understand and fall back cleanly (`src/lib/store.ts:25`) rather than crash on an old export.

The muscle-weighting map on `Exercise` (`Partial<Record<MuscleId, number>>`) is the one idea the whole app is built on (SPEC.md §2): a set's volume splits across every muscle it trains, weighted, instead of being credited to one label.

## Shape

- `DB` — `version: 1`, `settings`, `customExercises: Exercise[]`, `sessions: Session[]`, `bodyweightLogs: BodyweightLog[]` — `src/types.ts:83-89`
- `Session` — closed union on `type`: `'lift' | 'cardio' | 'polo'`, each with its own required fields (`LiftSession` has `sets`; `CardioSession` has `activity`/`distanceKm`; `PoloSession` has `chukkas`/`horses`) — `src/types.ts:39-71`. See the Polo name-collision in `../../CONTEXT.md` before assuming Polo is a `CardioSession`.
- `LiftSet` — `exerciseId`, `weightKg`, `reps`, optional `rpe`, optional `supersetId`/`round` for grouped superset logging — `src/types.ts:28-35`
- `Exercise` — `id`, `name`, `category` (`push|pull|legs|core`), `bodyweight: boolean`, `muscles: Partial<Record<MuscleId, number>>` — `src/types.ts:20-26`
- `MuscleId` — 15 fixed string-literal IDs, listed in full at `src/types.ts:1-16` and again (with labels) in `objects/exercise-library/exercises.md`. **Fixed on purpose** — CLAUDE.md hard rule: changing one is a data migration, not an edit.
- Dates are local `YYYY-MM-DD` strings everywhere, never `Date`/ISO timestamps — SPEC.md §4, enforced by `store.todayLocalDate()` (`src/lib/store.ts:70-76`).

## Connected to

- **owns:** nothing lower — this is the leaf schema
- **owned-by:** `objects/store/store.md` (the only module allowed to read/write it), `objects/exercise-library/exercises.md` (seed `Exercise[]` merges into `allExercises()`)
- **joins:** `objects/metrics/metrics.md` reads `Session[]`/`Exercise[]` and derives everything else — never writes back to `DB`
- **looks-like-but-is-not:** a `CardioSession` with `activity: 'polo'` — Polo is its own `Session` variant (see collision note above)

## If you change this

- **Hits:** every screen (all read `DB` via `loadDB`), `metrics.ts` (every function takes `Session[]`/`Exercise[]` shaped like this), the JSON export/import round-trip (`objects/store/store.md`), `bodyRegions.ts` if you touch `MuscleId`
- **Does not hit:** `bodyRegions.ts`'s path/contour data itself (keyed by `MuscleId` string, not by shape) — adding a field to `DB` doesn't touch the body map's SVG data, only adding/removing a `MuscleId` does

## Surfaces

| Surface | Role |
|---|---|
| `src/lib/store.ts` | reads / writes (the only file allowed to) |
| every screen under `src/screens/` | reads, via `store.loadDB()` |
| `src/lib/metrics.ts` | reads only, never persists a derived value back |
| human, via Progress → Data | reads/writes indirectly through JSON export/import |

## See

- Source: `src/types.ts`
- Spec: repo-root `SPEC.md` §3 (muscle IDs) and §4 (data model)
