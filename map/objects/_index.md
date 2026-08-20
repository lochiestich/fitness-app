# objects — index

One line per noun cluster. Open a card only after checking here — don't slurp the whole folder.

| Cluster | Card | Status | Covers |
|---|---|---|---|
| `data-model` | [db.md](data-model/db.md) | verified | `DB`, `Session` union, `Exercise`, `LiftSet`, `MuscleId`, `Settings`, `BodyweightLog` — `src/types.ts` |
| `store` | [store.md](store/store.md) | verified | the only module allowed to touch `localStorage` — `src/lib/store.ts` |
| `metrics` | [metrics.md](metrics/metrics.md) | verified | ~40 pure derived-calc functions (volume, e1RM, fatigue, pace) — `src/lib/metrics.ts` |
| `body-map` | [body-regions.md](body-map/body-regions.md) | verified | traced anatomical SVG region data + renderer — `src/lib/bodyRegions.ts`, `src/components/BodyMap.tsx` |
| `exercise-library` | [exercises.md](exercise-library/exercises.md) | verified | seed exercises, muscle groups, browse categories — `src/data/exercises.json`, `src/lib/muscles.ts` |
| `screens-and-routing` | [app-shell.md](screens-and-routing/app-shell.md) | verified | route table, tab bar, the four tab screens + Calendar/Day — `src/App.tsx`, `src/screens/` |

All six are `live`, audited at the baseline in `_meta/schema.md`. No `leftover` or `ghost` nouns found in this pass.
