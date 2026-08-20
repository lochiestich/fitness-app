---
type: object
cluster: body-map
universe: live
status: verified
entity: src/lib/bodyRegions.ts
---

# body-regions (the Body screen's silhouette)

The traced-anatomy SVG path data behind the Body screen's front/back figures, plus the component that renders it. Product name "body map"; the data file is `bodyRegions.ts`, the renderer is `BodyMap.tsx` — two files, one noun.

## Why this shape

This replaced an earlier version built from plain `<rect>` shapes (14 abstract rounded rectangles, one per region) with real vector contours traced from a reference anatomy image, run through connected-component segmentation and manually classified into the app's 18 `MuscleId`s. The rectangle version was cheap to build but didn't look like a body; the trace is expensive data (16 `REGIONS` entries, ~144 path strings, ~110KB) but is real anatomy. The source trace and the Python pipeline that produced this file are **not checked into this repo** — they live in a separate scratchpad workspace kept deliberately outside the app per the project's own working style ("separate to the app for the time being"). This file is the finished export; regenerating it requires that external pipeline, so treat the `REGIONS` array as opaque, hand-maintained data, not something to hand-edit path-by-path. Exception: a region's top-level `muscles: MuscleId[]` array (as opposed to its `front`/`back` path data) is safe to hand-edit directly — that's how `abductors` was added, piggy-backing on the whole `glutes` shape with no new tracing at all.

`adductors` did get real tracing work, unlike `abductors`: the `quads` region's front paths (10 of them, the only front-of-thigh shapes this trace has) were split by hand into an inner-thigh subset (4 paths, closest to the groin midline) and an outer/lower subset (6 paths) — confirmed against a reference diagram the user provided showing the inner-thigh wedge specifically, not the whole quad. The inner 4 became their own `adductors` region; the outer 6 stay `quads`-only. `abductors` didn't get the same treatment — it shares the *entire* `glutes` shape (all 6 paths), confirmed against the same reference diagram, which showed abductors covering the full glute area, not a sub-region. So `abductors` blends with `glutes` the way `shoulders` blends `front_delts` + `side_delts`, while `adductors` is a real standalone region like `rear_delts` or `traps`.

## Shape

- `REGIONS: BodyRegion[]` — 16 entries, one per visual region: `{ id, label, muscles: MuscleId[], front: string[], back: string[] }` — `src/lib/bodyRegions.ts`
- `front`/`back` are arrays of SVG `path` `d` strings in a shared coordinate space; a region can have paths in one view, both, or (rare) neither
- `FRONT_VIEWBOX = '95 310 820 1950'`, `BACK_VIEWBOX = '895 310 820 1950'` — two figures side-by-side in one traced canvas, cropped per view
- 14 of the 16 regions map 1:1 to a `MuscleId`; **two carry more than one**, both averaged the same way by `BodyMap.tsx`: `shoulders` merges `front_delts` + `side_delts` per SPEC.md §6 ("Shoulders is shown as one region combining front/side delts"); `glutes` also carries `abductors` (SPEC.md §3) — `abductors` has no traced shape of its own, so a hip thrust and an abductor machine both light up the same area, blended. `adductors` is its own separate region, carved out of what used to be part of `quads`. `rear_delts` is its own separate region too. See the Shoulders collision in `../../CONTEXT.md`.
- `BodyMap.tsx` renders both `<svg>` figures, looping `REGIONS` per view and filling each path with `fatigueColor(average of that region's muscles' fatigue values)` — `src/components/BodyMap.tsx`
- Known cosmetic issue, left as-is on purpose: quad/calf and calf/foot regions on the legs have a couple of spots where the traced linework doesn't fully close, so fill bleeds slightly across the joint. Two of these (the knee pinch point, and a stray elbow-crease shape wrongly bucketed into triceps) were found and fixed this session — see git log on `src/lib/bodyRegions.ts` around commits `d99a5f5` and after for what "fixed" looked like if a similar leak turns up elsewhere.

## Connected to

- **owns:** nothing — it's rendered, not written to
- **owned-by:** nothing writes it at runtime; it's a static export from the external trace pipeline
- **joins:** `objects/metrics/metrics.md` (`muscleFatigue()` output is the only input `BodyMap` needs besides this file), `src/screens/body/MuscleScores.tsx` (reads the same `REGIONS` array to build the 16-row score list — one row per region, matching the Body screen's map exactly)
- **looks-like-but-is-not:** a per-`MuscleId` shape list — it's per-*region*, and `shoulders` and `glutes` each cover two `MuscleId`s

## If you change this

- **Hits:** the Body screen's figures, `MuscleScores.tsx`'s row count and labels (currently 16 — SPEC.md §6 says "one row per visual region")
- **Does not hit:** `DB`'s schema, `metrics.ts`, or anything in `store.ts` — this is presentation data with no persisted counterpart; a bad edit here can only break how fatigue is *drawn*, not what fatigue *is*

## Surfaces

| Surface | Role |
|---|---|
| `src/components/BodyMap.tsx` | reads (renders paths + fatigue color) |
| `src/screens/body/MuscleScores.tsx` | reads (builds the score list) |
| human, via the Body screen | reads only — no write path exists in-app |

## See

- Source: `src/lib/bodyRegions.ts`, `src/components/BodyMap.tsx`
- Spec: repo-root `SPEC.md` §6 ("Body")
