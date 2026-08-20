---
type: object
cluster: store
universe: live
status: verified
entity: src/lib/store.ts
---

# store

The only module allowed to touch `localStorage` — CLAUDE.md hard rule, not a convention. Every load, save, CRUD, and JSON export/import goes through here.

## Why this shape

Centralizing storage access in one file is what makes "swap to IndexedDB is one file" (SPEC.md §8) actually true, and what makes the `version: 1` fallback (a corrupt or pre-migration blob silently becomes a fresh `defaultDB()`) a single guarantee instead of something every caller has to reimplement. Every write function follows the same pattern — `loadDB()`, mutate the in-memory tree, `saveDB()`, return the new `DB` — so callers never hold a stale reference across a write.

## Shape

Plain exported functions, no class, no React import (consistent with `metrics.ts` — see `objects/metrics/metrics.md`):

- `loadDB()` / `saveDB(db)` — the only two functions that touch `localStorage` directly — `src/lib/store.ts:20-34`
- Session writes: `addSession`, `deleteSession`, `upsertSession` (the log screens exclusively use `upsertSession` for autosave-in-place) — `src/lib/store.ts:36-57`
- Exercise reads/writes: `allExercises` (seed JSON + `db.customExercises` merged), `addCustomExercise` — `src/lib/store.ts:59-68`
- Date/id helpers: `todayLocalDate`, `newId` — `src/lib/store.ts:70-80`
- Lookups used to prefill forms: `sessionsMostRecentFirst`, `lastLiftSession`, `liftSessionOnDate`, `lastSetForExercise`, `knownHorses` — `src/lib/store.ts:82-122`
- Bodyweight: `addBodyweightLog`, `bodyweightLogsSorted`, `currentBodyweightKg` (latest log wins, falls back to `settings.bodyweightKg`) — `src/lib/store.ts:124-140`
- Backup: `exportJSON`, `importJSON` (rejects on `version !== 1`) — `src/lib/store.ts:142-151`. **Ghost:** written, exported, never called from any screen — SPEC.md §6 documents export/import (and a CSV export that doesn't exist in any form) as a Progress → Data feature, but no UI wires these up yet. See `processes/backup-export-import.md`.

## Connected to

- **owns:** the `localStorage` key `training-log:db` — nothing else may read or write it
- **owned-by:** nothing — this is the floor
- **joins:** `src/data/exercises.json` and `src/data/horses.json` (seed data, merged in at read time, never copied into the persisted `DB`)
- **looks-like-but-is-not:** `metrics.ts` — both are "lib" files with no React import, but `metrics.ts` never touches `localStorage` and `store.ts` never derives anything (see `objects/metrics/metrics.md`)

## If you change this

- **Hits:** every screen (all data flows through `loadDB`), the `processes/log-a-session.md` and `processes/backup-export-import.md` process cards, any future migration off `localStorage`
- **Does not hit:** the shape of derived values (fatigue, volume, e1RM) — those are computed fresh by `metrics.ts` on every read and never stored, so a `store.ts` change can't silently make a derived number wrong the way a schema change could

## Surfaces

| Surface | Role |
|---|---|
| every screen under `src/screens/` | reads and writes |
| `src/lib/metrics.ts` | reads the `Session[]`/`Exercise[]` this module returns; never calls back into it |
| human, via Progress → Data | writes indirectly through `exportJSON`/`importJSON` |

## See

- Source: `src/lib/store.ts`
- Spec: repo-root `SPEC.md` §8 ("Storage layer isolation")
