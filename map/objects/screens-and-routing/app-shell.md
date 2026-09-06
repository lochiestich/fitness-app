---
type: object
cluster: screens-and-routing
universe: live
status: verified
entity: src/App.tsx
---

# app-shell (routing + the four tab screens)

The `HashRouter` route table, the bottom tab bar, and the screen components each route mounts. Product name "the app" / "the four tabs"; code name is just `App.tsx` + `screens/`.

## Why this shape

`HashRouter`, not `BrowserRouter` — GitHub Pages serves static files with no server-side rewrite, so a path-based router 404s on refresh; hash routing sidesteps that entirely (SPEC.md §8). The tab bar is deliberately capped at four tabs (Today/Log/Body/Progress) even though there's more to navigate to — Calendar and Day are reached via an "Open calendar" link from Progress, not a fifth tab, because SPEC.md §6 fixes the bar at four for thumb-reach reasons. Log's Lift/Cardio split is a `SegmentedControl`, not two routes, because both write into the same autosaving flow and share the backdating logic below.

## Shape

- Routes — `src/App.tsx:15-22`: `/` → Today, `/log` → Log, `/body` → Body, `/progress` → Progress, `/calendar` → Calendar, `/day/:date` → Day
- `TabBar` — four `NavLink`s only (Today/Log/Body/Progress); Calendar/Day are intentionally not in this list — `src/components/TabBar.tsx:4-9`
- `Log` screen — `SegmentedControl` toggles `LogType = 'lift' | 'cardio'`; Polo is *not* a third option here, it's an activity choice inside `LogCardio` (see the Polo collision in `../../CONTEXT.md`) — `src/screens/Log.tsx`
- Backdating — every log form takes an optional `date` from router state (`{ type, date }`); when set and not today, a banner reads "Logging for {date}". `Day.tsx`'s "Add a session for this day" button is the only place that navigates to `/log` with a non-today date — `src/screens/Log.tsx:12-21`, `src/screens/Day.tsx`
- Screen-to-derived-data wiring: every screen calls `store.loadDB()` then hands the result to one or more `metrics.ts` functions on mount — see `objects/metrics/metrics.md` and `processes/render-derived-view.md`
- Sub-screens live one level down and are owned by their parent, not independently routed: `screens/log/*` (LogLift, LogCardio, SupersetBuilder, SupersetRounds), `screens/body/*` (MuscleScores, VolumeBars), `screens/today/*` (StreakBar, GoalsWidget, LeastLoaded, RecentSessions), `screens/progress/*` (WeeklyLoadChart, ConsistencyGrid, CategoryBreakdown, LiftingProgress, CardioProgress, PoloProgress, BodyweightProgress, PersonalRecords)

## Connected to

- **owns:** the route table; nothing else decides what URL shows what screen
- **owned-by:** nothing — this is the top of the render tree (`src/main.tsx` mounts `App`)
- **joins:** every other cluster in this map — this is the wiring layer, not a data owner itself
- **looks-like-but-is-not:** a five-tab app — Calendar/Day are real routes but deliberately not tab-bar entries

## If you change this

- **Hits:** literally every screen, since this is the shell they all mount inside; adding a route without a tab-bar entry is a supported, existing pattern (Calendar/Day already do this) — not automatically a bug
- **Does not hit:** `DB` shape, `metrics.ts`, `bodyRegions.ts` — this cluster is pure wiring, it doesn't own or transform data itself

## Surfaces

| Surface | Role |
|---|---|
| human, via the bottom tab bar and in-screen links | navigates |
| `src/main.tsx` | mounts `App` once, at startup |
| every screen file | reads `store`/`metrics` on mount, writes via log forms |

## See

- Source: `src/App.tsx`, `src/components/TabBar.tsx`, `src/screens/`
- Spec: repo-root `SPEC.md` §6 (screens) and §8 ("GitHub Pages base path")
