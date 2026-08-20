---
type: process
status: stub
universe: ghost
consumes: ["../objects/store/store.md"]
produces: []
---

# backup-export-import (ghost — documented, not wired)

**This process does not run today.** It's here so a future "add the backup UI" task starts from what already exists instead of rediscovering it.

## What exists

`store.ts` has fully-implemented `exportJSON()` (serializes the whole `DB` to a JSON string) and `importJSON(json)` (parses, checks `version === 1`, calls `saveDB`) — `src/lib/store.ts:142-151`. Neither is imported or called anywhere under `src/screens/` or `src/components/`. No file download/share, no file-picker, no CSV export of any kind exists in the codebase.

## Why it's a ghost, not a bug

SPEC.md §6 lists "Data: export CSV, export JSON backup, import JSON backup" as part of the Progress screen's spec, and §8 calls the JSON export the safety net for Safari's storage eviction ("Prompt for a backup every thirty days"). The functions were built to that spec; the UI to trigger them wasn't, yet. That's a real gap between the spec and the shipped app — worth knowing before assuming Progress → Data is a working feature, and worth closing before relying on Safari not silently evicting a phone's only copy of the data.

## If you're the one building it

- **Hits (once wired):** Progress screen (needs a new "Data" section), nothing else — `exportJSON`/`importJSON` already round-trip the full `DB` correctly against `objects/data-model/db.md`'s current shape
- **Does not hit:** `store.ts` itself — the functions as written need no changes, just a caller
- **Still missing even once wired:** CSV export has no implementation to call — that part of SPEC.md §6 needs code written, not just a button

## See

- Objects: `../objects/store/store.md`
- Source: `src/lib/store.ts:142-151` (what exists), repo-root `SPEC.md` §6 and §8 (what's specified)
