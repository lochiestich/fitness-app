# Training Log — Spec

A personal training tracker. Lifting, cardio and polo in one place, installed on a phone, working with no signal.

---

## 1. Decisions already made

| Question | Answer |
|---|---|
| Platform | Phone only, installable to home screen (PWA) |
| Data | On device. No account, no server, no login |
| Scope for v1 | Lifting, cardio and polo, all three |
| Network | Must work fully offline. No CDN, no API calls, no analytics |
| Deploy | GitHub Pages, static build |

Single user. No sharing, no social, no cloud. If it ever needs to move to another phone, that happens through a JSON export file.

---

## 2. The one idea the app is built on

Every exercise carries a **muscle weighting map**, not a single label.

```json
"barbell_bench_press": { "chest": 1.0, "triceps": 0.5, "front_delts": 0.4 }
```

A set of 60 kg for 8 reps produces 480 kg of volume. That volume is then split:

- chest: 480
- triceps: 240
- front delts: 192

Do this for every set and weekly volume per muscle group falls out for free. It answers the thing a normal tracker cannot: your triceps are being hammered by pressing on days you never trained triceps, and your rear delts have not been touched in three weeks.

The seed library lives in `src/data/exercises.json`. Factors are deliberately coarse. 1.0 means prime mover, 0.5 means meaningful assistance, 0.3 means real but minor. This is a training heuristic, not biomechanics.

---

## 3. Muscle groups

Fifteen, fixed. These IDs are used everywhere and must never change without a data migration.

```
chest  front_delts  side_delts  rear_delts  lats  upper_back
biceps  triceps  forearms  core  lower_back
glutes  quads  hamstrings  calves
```

---

## 4. Data model

One store, versioned, saved as a single JSON blob.

```ts
type DB = {
  version: 1
  settings: {
    bodyweightKg: number      // used for bodyweight exercise load
    weeklySessionTarget: number
  }
  customExercises: Exercise[]
  sessions: Session[]
}

type Exercise = {
  id: string
  name: string
  category: 'push' | 'pull' | 'legs' | 'core'
  bodyweight: boolean        // if true, load = bodyweightKg + addedKg
  muscles: Record<MuscleId, number>
}

type Session =
  | { id, date, type: 'lift',   rpe?, durationMin?, notes?, sets: LiftSet[] }
  | { id, date, type: 'cardio', rpe?, durationMin, notes?, activity, distanceKm? }
  | { id, date, type: 'polo',   rpe?, durationMin, notes?, chukkas, horses: string[] }

type LiftSet = {
  exerciseId: string
  weightKg: number           // added weight; 0 for pure bodyweight
  reps: number
  rpe?: number               // 1 to 10
}
```

`date` is an ISO date string, `YYYY-MM-DD`, local time. Never store timestamps as UTC midnight — a session logged at 9pm in Nairobi must not land on the wrong day.

Cardio activities: `run`, `swim`, `cycle`, `row`, `walk`, `other`.

---

## 5. Derived numbers

All calculated on read. Nothing derived is ever stored.

**Load for a set**
`bodyweight ? settings.bodyweightKg + weightKg : weightKg`

**Set volume** = load × reps

**Muscle volume** = Σ over sets of (set volume × muscle factor)

**Estimated 1RM** (Epley) = load × (1 + reps / 30)
Track the best e1RM per exercise per session. This is the improvement line.

**Session load** (sRPE) = durationMin × rpe
The one number that makes lifting, swimming and chukkas comparable. If a lifting session has no duration, estimate 2.5 minutes per set.

**Muscle fatigue** for the body map, 0 to 1:
Σ over the last 10 days of (muscle volume that day × e^(−daysAgo / 2.5)), then normalise against that muscle's own rolling 8 week peak. Normalise per muscle, not globally, otherwise quads always read hot and rear delts always read cold.

**Pace**
- run and walk: min/km
- swim: min/100m
- cycle and row: km/h

---

## 6. Screens

Bottom tab bar, four tabs. Thumb reach matters, this gets used between sets with one hand.

### Today
- A 7-day streak bar (M–S) under the title: a pip per day, filled when any session happened that day, current day marked, future days dashed
- Weekly goals widget: a progress ring for Lifts and one for Cardio (target fixed at 3 each for now, not user-editable). Polo counts toward the Cardio ring, it isn't tracked separately
- Least loaded muscle groups over the last 10 days, as a plain sentence
- Recent sessions, tap to open, long press to delete

### Log
Segmented control at the top: Lift / Cardio. Polo is not a separate tab — it's an activity choice inside Cardio (see below), so logging it still produces a `type: 'polo'` session under the hood, just reached through the Cardio form.

**Lift** is the one that has to be fast. Target is under 30 seconds for a full session entry.
- Search, or browse by broad muscle group (Chest/Shoulders/Back/Arms/Legs/Core), each backed by the fixed 15 muscle IDs
- Weight and reps prefill from the last time that exercise was used
- Add set, duplicate last set, remove set
- "Repeat last session" prefills the whole thing
- Autosaves continuously to a single running session for the day — no explicit save/finish step
- Supersets: build a circuit of 2+ exercises, then log one round (weight/reps per exercise) at a time; rounds are tagged and shown grouped in the set list

**Cardio**: activity (Run, Swim, Polo, Cycle, Row, Walk, Other), duration, optional distance with a km/m/mi selector, RPE, notes. Choosing **Polo** swaps the distance field for chukkas and adds a horse chip picker (autocomplete from a seeded roster plus anything logged before); duration is then auto-computed as chukkas × 7.5 min and RPE is hidden, matching how the standalone Polo form worked before the merge.

### Body
Front and back silhouette, coloured by fatigue on a cool to hot ramp, legend states plainly that hot means recently loaded, not that it needs work. Not tap-to-drill-down — a plain score list (0–100, most loaded first) sits underneath the map instead, one row per visual region (Shoulders is shown as one region combining front/side delts; every other region is a single muscle).

Below that: horizontal bars, volume by muscle group, 7 day and 28 day toggle.

### Progress
- Weekly training load, last 12 weeks
- Consistency grid, last 12 weeks, one cell per day coloured by session type
- Lifting: pick an exercise, see e1RM over time plus the best set
- Cardio: pick an activity, see pace over time and weekly distance (polo isn't included here — no pace/distance concept applies)
- Bodyweight: log a weigh-in, see it over time; the latest entry becomes the current bodyweight used everywhere else
- Personal records, auto detected
- Data: export CSV, export JSON backup, import JSON backup

No streaks, no badges, no guilt copy. Consistency is shown as a grid and a count. A rest week is information, not a failure.

---

## 7. Build order

Ship each phase to the phone before starting the next. If phase 0 is not on the home screen by the end of day one, the whole thing dies on localhost.

| Phase | Goal | Done when |
|---|---|---|
| 0 | Scaffold, PWA, deploy | A blank app installs from GitHub Pages and opens in airplane mode |
| 1 | Storage layer + all three log forms | Log a lift, a run and a chukka session, reload the app, they are still there |
| 2 | Today screen | Week summary and recent sessions render from real data |
| 3 | Body map + volume bars | Muscle volume splits correctly across linked groups |
| 4 | Progress charts and PRs | e1RM line moves when a heavier set is logged |
| 5 | Export, import, custom exercises, polish | A JSON backup restores cleanly into a wiped app |

---

## 8. Things that will bite

**GitHub Pages base path.** Set `base: '/repo-name/'` in `vite.config.ts` and use `HashRouter`, not `BrowserRouter`. Otherwise every route 404s in production and works fine locally.

**iOS home screen icon.** Needs a real 180×180 PNG at `apple-touch-icon.png`. SVG icons do not work on iOS and you get a blank grey square.

**Safe area insets.** The bottom tab bar sits under the home indicator unless you use `viewport-fit=cover` and `padding-bottom: env(safe-area-inset-bottom)`.

**Safari storage eviction.** Safari can clear localStorage for sites unused for seven days. Installed PWAs are much safer, but this is exactly why the JSON export exists. Prompt for a backup every thirty days.

**Storage layer isolation.** All reads and writes go through `src/lib/store.ts`. Nothing else in the app touches localStorage directly. When the data outgrows it, swapping to IndexedDB is one file.

**Bodyweight changes over time.** A bodyweight log now exists (`DB.bodyweightLogs`, logged from Progress) so weight can actually be tracked. Load calculations still use a single *current* value (the most recent log entry, falling back to `settings.bodyweightKg` if none exist) applied uniformly across all history — a bodyweight-corrected past is still out of scope, only the current value updates automatically now instead of needing a manual settings edit.
