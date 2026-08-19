# CLAUDE.md

Personal training tracker. Lifting, cardio and polo. Installed on a phone, stores everything on device, works with no signal.

Read `SPEC.md` before writing code. It holds the data model, the derived calculations and the build order.

## Stack

- Vite + React + TypeScript
- Recharts for line and bar charts
- Hand written SVG for the body map, no library
- `vite-plugin-pwa` for the service worker and manifest
- `HashRouter` from react-router
- localStorage behind a repository layer, no database
- No CSS framework. Plain CSS with custom properties in `src/styles/tokens.css`

Deployed as a static build to GitHub Pages.

## Commands

```bash
npm run dev      # local
npm run build    # production build
npm run preview  # test the built PWA locally
npm run deploy   # build and push to gh-pages
```

## Hard rules

- **No network calls.** No fetch, no CDN links, no fonts from Google, no analytics, no error reporting. Everything ships in the bundle. The app must open in airplane mode.
- **No accounts, no auth, no backend.** If a feature needs a server, it does not go in.
- **Only `src/lib/store.ts` touches localStorage.** Every other file goes through it.
- **Muscle IDs are fixed.** The fifteen in SPEC.md section 3. Changing one is a data migration, not an edit.
- **Never write a derived value into the store.** Volume, e1RM, fatigue and pace are always calculated on read.
- **Dates are local `YYYY-MM-DD` strings.** Never `toISOString()` on a Date for storage, it shifts the day across timezones.
- **Do not add features that are not in SPEC.md.** No streaks, no gamification, no social, no AI coach. If something seems missing, ask before building it.

## Conventions

- Functional components, hooks, no class components
- Types in `src/types.ts`, shared and imported, not redeclared per file
- Pure calculation functions in `src/lib/metrics.ts`, no React imports in that file
- Unit tests with Vitest for anything in `metrics.ts`. Volume splitting and e1RM are where the bugs will be, so those get tests before the UI that displays them.
- Components stay under about 150 lines. Split when they grow past that.

## Structure

```
src/
  data/exercises.json     seed library with muscle weighting maps
  lib/store.ts            load, save, export, import, migrations
  lib/metrics.ts          volume, e1RM, fatigue, pace, session load
  types.ts
  screens/                Today, Log, Body, Progress
  components/
  styles/tokens.css
```

## Design

Dark, quiet, high contrast. Readable in a gym at night and in the sun at a polo ground.

The body map is the one bold element. Everything around it stays plain. No gradients on cards, no glow effects, no decorative icons.

Numbers are the content. Use tabular figures so columns line up. Big numbers get a serif face, table data gets the system sans.

Touch targets 44px minimum. Number inputs use `inputmode="decimal"`. Respect `prefers-reduced-motion`.

## Working style

- Ship phase by phase per SPEC.md section 7. Do not start the next phase until the current one is deployed and working on the phone.
- After each step, state in one line what was completed.
- Stop and ask before: deleting files, changing the data schema, adding a dependency, or force pushing.
- Make only the change asked for. Do not refactor surrounding code or add features that were not requested.
