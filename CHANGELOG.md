# Changelog

All notable changes to the ILOS template. Run `/update` to move to a newer release; your data is never touched.

## 1.0.0 — first public release

### Added
- `/update`: shows what would change, applies only on confirmation, keeps a `.bak` copy of any template file you edited, never touches your data, and logs to `SYSTEM/update-log.md`.
- `AGENTS.md` as the operating contract for any agent (`CLAUDE.md` loads it). Put personal instructions in `CLAUDE.local.md`.
- `SYSTEM/foundation-manifest.yaml`: which paths are template files and which are yours.
- `SYSTEM/tana-ids.yaml`: one file for every Tana ID the skills use, filled by `/tana-understand`, which also reports what your workspace is missing (for example no `#decision` tag) instead of failing mid-sync.
- `ILOS-KNOWLEDGE/videos/README.md`: the six Tana template videos, linked from `/help` and `/guide`.
- `SYSTEM/tools/`: `skill-lint`, `check-manifest`, `migrate-ids` and `update`, with tests (`node --test SYSTEM/tools/*.test.js`).

### Changed
- One win format everywhere: `description`, `scale`, `emotional_weight`, `tags` (older `title`/`source` lines still display and sync).
- `/help` groups the Tana skills into "sync" (setup in two steps) and "tools".
- The dashboard runs on port 3100 (was 3000; `PORT` still overrides) and says on screen that it is a read-only overview of your local files, not a replacement for Tana.

### Fixed
- A win could be pushed to Tana twice (`/win` and `/sync`); `/build`, `/decision` and the Tana agent now share the same no-duplicates bookkeeping.
- Unresolved placeholder IDs in `/sync`; a blank ID now skips the Tana step and keeps the item local.
- `/sync-setup` no longer erases your Tana node overrides when it rewrites `sync-config.yaml`.

### Removed
- The Cosmic Blueprint teaser view in the dashboard.
- The blank Markdown ID tables in `SYSTEM/tana-reference/` (older copies keep theirs for the migration).

### Migrating from a pre-1.0 copy
`/update` recognises template files from any earlier download, so only files you edited are replaced with a `.bak` copy kept. It then offers to move your IDs from the old `SYSTEM/tana-reference/` tables into `SYSTEM/tana-ids.yaml`.

### Planned (not in 1.0)
- Dashboard redesign and an extension API (`dashboard/extensions/`).
- Video transcripts with timestamps.
- Methodology diagrams and the onboarding emails.
- One shared Tana write recipe and a single `/tana-setup` command replacing `/tana-understand` + `/sync-setup`.
