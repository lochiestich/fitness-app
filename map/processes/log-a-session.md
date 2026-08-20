---
type: process
status: verified
universe: live
consumes: ["../objects/data-model/db.md", "../objects/store/store.md", "../objects/exercise-library/exercises.md"]
produces: ["../objects/data-model/db.md"]
---

# log-a-session

Turning a workout, run, or chukka into a persisted `Session`, from the Log screen's segmented control down to a `localStorage` write.

## Input → Movement → Output

A person fills in the Lift or Cardio form (optionally pre-dated, for backdating past days). Lift autosaves continuously as sets are added — no save button; Cardio and Polo require an explicit "Save session" tap. Either path ends at `store.ts`, which writes the whole `DB` tree back to `localStorage`.

## Why this shape

Lift logging has to be fast (SPEC.md §6: under 30 seconds for a full session) — continuous autosave-in-place removes the "did I save?" step entirely, at the cost of needing `upsertSession` (not `addSession`) so repeated calls for the same day's session update rather than duplicate. Cardio/Polo don't have that time pressure (one entry per session, not one tap per set), so an explicit save with a "Saved" confirmation flash is clearer than silent autosave there. Both paths converge on the same `Session` union and the same `store.ts` write functions — there's no separate write path per session type.

## Steps

1. `Log.tsx` reads router state for an optional `{ type, date }`; if `date` is set and isn't today, every form shows a "Logging for {date}" banner instead of a separate backdating UI — `src/screens/Log.tsx:12-21`
2. **Lift:** `LogLift.tsx` finds or creates today's (or the backdated day's) lift session via `liftSessionOnDate`/`newId`, then calls `persist()` — which calls `upsertSession()` on every set add/edit/remove, or `deleteSession()` if the set list empties out — `src/screens/log/LogLift.tsx:60-84`. Superset rounds are tagged with `supersetId`/`round` on each `LiftSet` rather than being a separate session type.
3. **Cardio/Polo:** `LogCardio.tsx` holds form state locally, uncommitted, until "Save session" is tapped; `save()` branches on `activity === 'polo'` and constructs either a `PoloSession` (`chukkas`, `horses`, duration auto-computed as `chukkas × MIN_PER_CHUKKA`) or a `CardioSession`, then calls `addSession()` once — `src/screens/log/LogCardio.tsx:58-80`
4. Either write function calls `store.saveDB()`, which serializes the whole `DB` to `localStorage` under `training-log:db` — `src/lib/store.ts:32-34`

## If you change this

- **Hits:** any screen reading sessions afterward (Today's recent list, Body/Progress's derived numbers, Calendar/Day) — they all re-read from `localStorage` on next mount, so a write here is immediately visible everywhere else
- **Does not hit:** `metrics.ts` — nothing here computes a derived number; volume/fatigue/e1RM are all recalculated later, on read, from whatever got written here

## Surfaces

| Surface | Role |
|---|---|
| human, via Log screen | writes |
| `src/lib/store.ts` | executes the actual write |
| `Day.tsx`'s "Add a session for this day" | the only entry point that starts this process with a non-today date |

## See

- Objects: `../objects/data-model/db.md`, `../objects/store/store.md`
- Source: `src/screens/Log.tsx`, `src/screens/log/LogLift.tsx`, `src/screens/log/LogCardio.tsx`
