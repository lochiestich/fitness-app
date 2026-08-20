# fitness-app map — how to walk it

This map describes `/home/user/fitness-app` (repo `lochiestich/fitness-app`), a personal training-tracker PWA. The repo itself is the source of truth; this map cites it and indexes it, it never restates the rules. For the actual data model and derived-number formulas, read `SPEC.md` at the repo root — cards here point at it rather than copying it.

## Universes

Nearly everything in this repo is **live** as of the audit baseline in `_meta/schema.md` — it's a small, single-branch, actively-deployed app with no dead/superseded code found. The one exception: `processes/backup-export-import.md` is a **ghost** — `store.ts` has fully-working `exportJSON`/`importJSON`, SPEC.md §6 specifies a backup UI for them, but no screen calls them. If you add a card later for something else half-built or superseded, mark its universe honestly; don't default to `live` out of habit.

## Name collisions — product language vs. code

These are the places where what a person calls a thing and what the code calls it disagree. Know these before reading any card, or the cards will look like they contradict each other.

- **"Shoulders" is not one muscle.** The Body screen shows one merged "Shoulders" region, but it's the average of two independent `MuscleId`s — `front_delts` and `side_delts`. `rear_delts` is a *third*, separately-tracked `MuscleId` shown as its own "Rear Delts" region on the back view. Conflating rear delts into the front "Shoulders" bucket was a real bug caught mid-build (see `objects/body-map/body-regions.md`) — don't repeat it.
- **"Polo" is reached through the Cardio form, but is not a `CardioSession`.** Logging Polo produces a fully separate `type: 'polo'` `Session` variant (`chukkas`, `horses[]`, no `distanceKm`/`activity`). The Log screen's segmented control only shows Lift/Cardio — Polo is an activity choice *inside* Cardio that swaps the form and writes a different session shape underneath. See `objects/data-model/session.md`.
- **"Arms" is a UI grouping that no longer exists** — the exercise picker used to lump `biceps`/`triceps`/`forearms` under one "Arms" browse button; it's since been split into three. There was never an `arms` `MuscleId`; check `objects/exercise-library/muscles.md` for the current browse-group list, not memory of an older screenshot.
- **"Load score" list has 14 rows, not 15.** One row per *visual region*, and Shoulders merges two `MuscleId`s into one row — see the Shoulders collision above. `objects/body-map/body-regions.md` is the card that owns this count.

## How to walk

1. Start at repo-root `CLAUDE.md` — it has one routing row pointing here.
2. Open `objects/_index.md` for the full noun list (stub vs. verified) before opening any card.
3. Pick the cluster that matches your question, open that one card. Don't read the whole `objects/` tree.
4. Changing something? Open `effects/CONTEXT.md` first — it says which cards to read before you touch a given noun.
5. Verbs (how things move, not just their shape) live in `processes/` — four of them, no more than that until a fifth one actually exists.

## Token budget

Entry (`CLAUDE.md` routing row) + this file + one card should land under ~6k tokens. If a single card is pulling in more than that, it's trying to be two cards.
