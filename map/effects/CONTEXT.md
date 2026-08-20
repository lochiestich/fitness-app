# effects — change-impact index

If you're about to change X, open these cards first. This is a catalog of where to look, not a restatement of what each card says — if this index and a card disagree, the card is right, fix this file.

| If you're changing... | Open these cards, in order |
|---|---|
| A `MuscleId` (adding, renaming, removing) | `objects/data-model/db.md` (it's a hard-rule migration, not an edit — CLAUDE.md) → `objects/exercise-library/exercises.md` (every seed exercise's `muscles` map) → `objects/body-map/body-regions.md` (region → muscle wiring) → `objects/metrics/metrics.md` (every function iterates `MUSCLE_IDS`) |
| `DB`'s shape (new field, new session type) | `objects/data-model/db.md` → `objects/store/store.md` (bump `version`, handle the old shape in `loadDB`) → every screen that destructures `DB` directly |
| A derived formula (volume, e1RM, fatigue, pace, sRPE) | `objects/metrics/metrics.md` → repo-root `SPEC.md` §5 (update the spec in the same change, it's the formula's real home) → `processes/render-derived-view.md` for which screens see the result |
| The Body screen's look (colors, region shapes, legend) | `objects/body-map/body-regions.md` only — it's presentation data with no persisted counterpart, changes here are isolated from `DB`/`metrics` |
| The exercise picker's browse groups | `objects/exercise-library/exercises.md` (`BROAD_GROUPS`) → `src/components/ExercisePicker.tsx` directly (not yet its own card — small enough to read in one pass) |
| How a session gets logged (autosave vs. save button, new session type) | `processes/log-a-session.md` → `objects/data-model/db.md` (the `Session` union) → `objects/store/store.md` |
| Adding a route or tab | `objects/screens-and-routing/app-shell.md` — check the four-tab-bar constraint (SPEC.md §6) before adding a fifth `NavLink` |
| Wiring up the backup/export UI | `processes/backup-export-import.md` first — it's a ghost, the functions already exist in `objects/store/store.md`, you're building the caller, not the logic. CSV export has no implementation anywhere; that part is new code, not wiring. |
| The build or deploy pipeline | `processes/build-and-deploy.md` — the two footguns (`base` path, `HashRouter`) are named there and in `SPEC.md` §8 |

## Not yet covered

`ExercisePicker.tsx`, `SessionRow.tsx`, `ChipInput.tsx`, and the individual `screens/progress/*`/`screens/today/*` sub-components don't have their own object cards yet — they're small, single-purpose, and read fine directly. Give one a card if it grows past ~150 lines (CLAUDE.md's own component-size convention) or starts accumulating its own non-obvious behavior worth citing.
