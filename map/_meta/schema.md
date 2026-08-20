# Schema — the rules of this map

The closed set of card types this map uses, and the naming they follow. When practice and this file disagree, reconcile the same day.

## Node types

| `type:` | Lives at | Carries |
|---|---|---|
| object | `objects/<cluster>/<slug>.md` | shape, why, connections, blast radius (see `_templates/object.md`) |
| process | `processes/<slug>.md` | input → movement → output, numbered steps with citations (see `_templates/process.md`) |

## Labels that make it queryable

- `cluster` — one of: `data-model`, `store`, `metrics`, `body-map`, `exercise-library`, `screens-and-routing`
- `universe` — `live` (in force), `leftover` (present, not the main path), `ghost` (named/filed, not wired). Applies to both object and process cards. Nearly everything in this repo is `live` as of the audit date below; the one exception found is `processes/backup-export-import.md` (`ghost` — implemented in `store.ts`, never called from any screen).
- `status` — `stub` (listed, no body yet) or `verified` (body filled in, cited against source, dated)
- `consumes` / `produces` (process cards only) — wikilink-style relative paths to object cards

## Naming

- Cluster folders and card filenames: kebab-case, matching the source file/type name where there is one (e.g. `db.md` for the `DB` type, `store.md` for `store.ts`).
- `_meta/` holds the rules (this file). `objects/_index.md` is a generated-by-hand index — when a card's status changes, update its line here in the same edit.

## Audit baseline

First written 2026-08-20, against `claude/node-version-check-zp9jrr` at commit `4a6712a`. Re-verify citations before trusting a card past a handful of commits from that point — see each card's own `status`/date, not this line, for its actual freshness.
