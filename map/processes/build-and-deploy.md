---
type: process
status: verified
universe: live
consumes: []
produces: []
---

# build-and-deploy

Getting a source change from this repo onto the live GitHub Pages URL a phone can install.

## Input → Movement → Output

`npm run deploy` runs a production Vite build, then pushes the built `dist/` folder to the `gh-pages` branch via the `gh-pages` npm package. Whatever branch is checked out when this runs is what goes live — there's no separate CI step that gates this on `main`.

## Why this shape

Static build, no server, by design (CLAUDE.md hard rule: no backend, must work in airplane mode). GitHub Pages serves whatever's on `gh-pages` as static files, so "deploy" is just "build correctly and push the output" — there's no build farm, no environment config, no secrets. The two things that actually break this if got wrong are both called out in SPEC.md §8: `base: '/repo-name/'` in `vite.config.ts` (every asset 404s without it) and `HashRouter` instead of `BrowserRouter` (every route 404s on refresh without it) — both already correctly set, verify they stay that way if `vite.config.ts` or `App.tsx`'s router import changes.

## Steps

1. `npm run build` → `tsc -b && vite build` — typecheck, then bundle. Also runs as part of `npm run deploy`, so a type error blocks deploy rather than shipping broken.
2. `vite-plugin-pwa` (configured in `vite.config.ts`) generates the service worker and manifest as part of the same build step — this is what makes the output installable, not a separate process.
3. `npm run deploy` → `vite build && gh-pages -d dist` — rebuilds, then the `gh-pages` package force-pushes `dist/`'s contents to the `gh-pages` branch (`package.json` scripts).
4. GitHub Pages serves that branch at the URL in `package.json`'s `homepage` field.

## If you change this

- **Hits:** nothing in the running app — this is pure tooling; a broken deploy means the *live* site is stale or 404s, not that source is wrong
- **Does not hit:** any persisted user data — `localStorage` lives on the phone, a redeploy doesn't touch it (and can't migrate it either, which is why `DB.version` and the export/import ghost process exist — see `processes/backup-export-import.md`)

## Surfaces

| Surface | Role |
|---|---|
| human, via `npm run deploy` | triggers |
| GitHub Pages | serves the result |
| phone, via "Add to Home Screen" | installs from the served result |

## See

- Source: `package.json` (`scripts`), `vite.config.ts`
- Spec: repo-root `SPEC.md` §8 ("GitHub Pages base path", "iOS home screen icon", "Safe area insets")
