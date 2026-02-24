# Example Memory Files

These files show what populated ILOS memory looks like after a few weeks of use. They are **examples only** — your actual data goes in the parent `MEMORY/` directory.

Each file demonstrates:
- **wins.jsonl** — Celebrating achievements across different life areas
- **decisions.jsonl** — Recording important choices with reasoning
- **failures.jsonl** — Turning setbacks into lessons (Gap to Gain)

To start your own memory, simply use the ILOS skills:
- `/win` — Captures a win and appends to `MEMORY/wins.jsonl`
- `/decision` — Walks through a decision framework and logs to `MEMORY/decisions.jsonl`
- Reviews automatically capture failures and experiences

**Format:** Each `.jsonl` file starts with a schema line, then one JSON object per line. Files are append-only — never edit or delete entries.
