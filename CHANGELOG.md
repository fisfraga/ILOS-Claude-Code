# Changelog

All notable changes to the ILOS template. Run `/update` to move to a newer release; your data is never touched.

## 1.1.0 — one Tana setup, one write recipe

### Added
- `SYSTEM/tana-mcp-setup.md`: how to connect Tana to Claude, step by step. It recommends Tana's **remote** MCP server (`https://app.tana.inc/mcp`, paid Tana plan, beta), which works with the desktop app closed and also in Claude Cowork, Claude Desktop and claude.ai. The free **local** server (Tana desktop open) stays as the second option.
- `/tana-setup`: one command that checks the connection (and points to the guide when Tana isn't connected), finds your workspace, fills `SYSTEM/tana-ids.yaml`, reports what your workspace supports, and sets full or partial sync. Safe to re-run: it only fills blanks and never touches your node overrides.
- `SYSTEM/tana-write-contract.md`: one recipe per thing ILOS writes to Tana (win, decision, goal, project, topic) — where it goes, which IDs it needs, what happens when one is missing, and how the push is recorded so nothing is pushed twice. Every skill that writes to Tana follows it.
- `skill-lint` rules: push templates live only in the contract and every writer cites it; skills never name an MCP server; the workspace ID is read from `tana-ids.yaml`.

### Changed
- The workspace ID lives in one place, `WORKSPACE_ID` in `SYSTEM/tana-ids.yaml`. A 1.0 `sync-config.yaml` that still has `tana_workspace_id` keeps working; `/tana-setup` moves it.
- `/tana` is a short hub that routes to the right skill, and the Tana agent routes to the contract instead of restating recipes.
- `/tana-understand` now only explores one tag, workflow or subsystem; first-time setup is `/tana-setup`.
- Goals that the review skills and `/sync` push are recorded in `sync-state.yaml`, so `/sync` never creates them a second time. Review skills push goals one at a time.
- A decision pushed to Tana carries the status it has locally (open, decided or set aside).
- `/help`, `/guide`, `ROUTING.md`, `AGENTS.md`, the README and `SYSTEM/setup-guide.md` point to `/tana-setup` and the connection guide.

### Fixed
- `/sync` stopped when the workspace ID was only in `tana-ids.yaml`.
- Pushing an older win no longer moves `last_pushed_win_id` backwards.
- `/decision` skips its Tana search when your workspace has no `#decision` tag.
- The "Tana MCP is not available" message named one particular server; it now points to `/mcp` and the guide.

### Deprecated
- `/sync-setup` now runs `/tana-setup`'s sync-mode step. It will be removed in a later release.

### Updating from 1.0
Run `/update`. It adds `/tana-setup`, the connection guide and the write contract, and updates the Tana skills; your data, `sync-config.yaml` and `tana-ids.yaml` are kept as they are. Then run `/tana-setup` once: it keeps every ID you already have and moves your workspace ID into `tana-ids.yaml`.

## 1.0.0 — first public release

### Added
- `/update`: shows what would change, applies only on confirmation, keeps a `.bak` copy of any template file you edited (never overwriting an earlier `.bak`), never touches your data, and logs to `SYSTEM/update-log.md`. The local tool decides what is your data whatever a download says, checks every downloaded file before the first write, refuses a malformed release, does not write through symlinks, and only runs inside an ILOS folder.
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

**Your first update from a pre-1.0 copy** (older copies don't have `/update` yet): download and unzip 1.0, then from your existing ILOS folder ask Claude to run, or run yourself:

```bash
node <path-to-unzipped-1.0>/SYSTEM/tools/update.js plan  <path-to-unzipped-1.0>   # shows what would change
node <path-to-unzipped-1.0>/SYSTEM/tools/update.js apply <path-to-unzipped-1.0>   # applies it
node SYSTEM/tools/migrate-ids.js --write                                          # moves your Tana IDs
```

After that, `/update` is installed and handles every later release.

### Planned (not in 1.0 or 1.1)
- Dashboard redesign and an extension API (`dashboard/extensions/`).
- Video transcripts with timestamps.
- Methodology diagrams and the onboarding emails.
- Remove the `/sync-setup` pointer (use `/tana-setup`).
