# ILOS Dashboard

A live, always-fresh web dashboard for your ILOS data. No build step. No framework.

## Quick Start

```bash
cd dashboard
npm install      # installs js-yaml (only dependency)
npm start        # → http://localhost:3100  (opens automatically)
```

Press `Ctrl+C` to stop.

## How It Works

- **Server** reads your YAML/JSONL files on every request — data is always current
- **Browser** fetches `/api/data` on load and renders all views client-side
- Refresh the page anytime to pick up changes to your data files

## Views

| Route | Description |
|-------|-------------|
| `#dashboard` | VPER wheel, elemental balance, recent wins, key areas overview |
| `#areas` | 12 Key Areas with health scores, filtered by element |
| `#goals` | Annual → Weekly goals with key results and progress |
| `#wins` | Win timeline + analytics (streaks, by area, weekly trend) |
| `#learn` | Education hub: VPER, Elements, Gap to Gain, 12 Areas, Goals, Planning |
| `#systems` | Strategy systems tracking grid + completion analytics |
| `#alignment` | Goal-to-vision coherence, area balance, system-to-goal audit |

## Data Sources

All files are read relative to the `ILOS-Template/` root:

| Data | File | Format |
|------|------|--------|
| VPER phase + elemental balance | `TIME/current-period.yaml` | YAML |
| Active goals | `TIME/active-goals.yaml` | YAML |
| Strategy systems | `TIME/strategy-systems.yaml` | YAML |
| Wins | `MEMORY/wins.jsonl` | JSONL |
| Vision (FPs, MTPs, HHGs) | `QUANTUM/vision/*.md` | Markdown |
**All files are optional.** Missing files show graceful empty states — no errors.

## Custom Port

```bash
PORT=3101 npm start
```

## Updating the Dashboard

The dashboard reads live files — no rebuild needed:
- Edit any YAML/JSONL file → refresh browser → changes appear immediately
- To update styles or JS logic, edit `public/style.css` or `public/app.js` directly → refresh browser
