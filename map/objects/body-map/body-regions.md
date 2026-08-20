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

This replaced an earlier version built from plain `<rect>` shapes (14 abstract rounded rectangles, one per region) with real vector contours traced from a reference anatomy image, run through connected-component segmentation and manually classified into the app's 16 `MuscleId`s. The rectangle version was cheap to build but didn't look like a body; the trace is expensive data (15 `REGIONS` entries, ~144 path strings, ~110KB) but is real anatomy. The source trace and the Python pipeline that produced this file are **not checked into this repo** — they live in a separate scratchpad workspace kept deliberately outside the app per the project's own working style ("separate to the app for the time being"). This file is the finished export; regenerating it requires that external pipeline, so treat the `REGIONS` array as opaque, hand-maintained data, not something to hand-edit path-by-path.

## Shape

- `REGIONS: BodyRegion[]` — 15 entries, one per visual region: `{ id, label, muscles: MuscleId[], front: string[], back: string[] }` — `src/lib/bodyRegions.ts`
- `front`/`back` are arrays of SVG `path` `d` strings in a shared coordinate space; a region can have paths in one view, both, or (rare) neither
- `FRONT_VIEWBOX = '95 310 820 1950'`, `BACK_VIEWBOX = '895 310 820 1950'` — two figures side-by-side in one traced canvas, cropped per view
- 14 of the 15 regions map 1:1 to a `MuscleId`; **`shoulders` is the one exception** — it merges `front_delts` + `side_delts` (averaged) into a single region, per SPEC.md §6 ("Shoulders is shown as one region combining front/side delts"). `rear_delts` is its own separate region. See the Shoulders collision in `../../CONTEXT.md`.
- `BodyMap.tsx` renders both `<svg>` figures, looping `REGIONS` per view and filling each path with `fatigueColor(average of that region's muscles' fatigue values)` — `src/components/BodyMap.tsx`
- Known cosmetic issue, left as-is on purpose: quad/calf and calf/foot regions on the legs have a couple of spots where the traced linework doesn't fully close, so fill bleeds slightly across the joint. Two of these (the knee pinch point, and a stray elbow-crease shape wrongly bucketed into triceps) were found and fixed this session — see git log on `src/lib/bodyRegions.ts` around commits `d99a5f5` and after for what "fixed" looked like if a similar leak turns up elsewhere.

## Connected to

- **owns:** nothing — it's rendered, not written to
- **owned-by:** nothing writes it at runtime; it's a static export from the external trace pipeline
- **joins:** `objects/metrics/metrics.md` (`muscleFatigue()` output is the only input `BodyMap` needs besides this file), `src/screens/body/MuscleScores.tsx` (reads the same `REGIONS` array to build the 15-row score list — one row per region, matching the Body screen's map exactly)
- **looks-like-but-is-not:** a per-`MuscleId` shape list — it's per-*region*, and `shoulders` covers two `MuscleId`s

## If you change this

- **Hits:** the Body screen's figures, `MuscleScores.tsx`'s row count and labels (currently 15 — SPEC.md §6 says "one row per visual region")
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
