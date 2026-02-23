# HTML Template

Base template for ILOS dashboard visualizations. Self-contained HTML with CSS Grid layout, dark/light mode, and zero dependencies.

Replace `{{DATA}}`, `{{VIEW_TYPE}}`, `{{GENERATED_AT}}`, and `{{USER_NAME}}` before writing the file.

## Full Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ILOS Dashboard — {{VIEW_TYPE}}</title>
    <style>
:root {
    --bg: #f8f7f4;
    --bg2: #ffffff;
    --bg3: #f0eeeb;
    --c1: #1a1816;
    --c2: #6b635a;
    --c3: #a8a29e;
    --accent: #c9a84c;
    --accent2: #8b7355;
    --win: #2d6a4f;
    --win-bg: #d8f3dc;
    --goal-active: #c9a84c;
    --goal-done: #2d6a4f;
    --goal-backlog: #a8a29e;
    --danger: #c1554d;
    --font: system-ui, -apple-system, 'Segoe UI', sans-serif;
    --radius: 10px;
    --shadow: 0 1px 3px rgba(0,0,0,.04), 0 4px 12px rgba(0,0,0,.06);
}
@media (prefers-color-scheme: dark) {
    :root {
        --bg: #0f0e0d;
        --bg2: #1a1918;
        --bg3: #242220;
        --c1: #f5f3f0;
        --c2: #a8a29e;
        --c3: #6b635a;
        --win-bg: #1a3a2a;
        --shadow: 0 1px 3px rgba(0,0,0,.2), 0 4px 12px rgba(0,0,0,.3);
    }
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    font-family: var(--font);
    background: var(--bg);
    color: var(--c1);
    line-height: 1.5;
    min-height: 100dvh;
}

.header {
    padding: 2rem 2rem 1rem;
    border-bottom: 1px solid var(--bg3);
    display: flex;
    justify-content: space-between;
    align-items: baseline;
}
.header h1 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--accent);
}
.header .meta {
    font-size: .75rem;
    color: var(--c3);
}

.dashboard {
    padding: 1.5rem 2rem 3rem;
    max-width: 1400px;
    margin: 0 auto;
}

/* Grid layouts per view */
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.grid-4x3 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.grid-1 { display: grid; grid-template-columns: 1fr; gap: 1.5rem; max-width: 800px; }

@media (max-width: 900px) {
    .grid-3, .grid-2, .grid-4x3 { grid-template-columns: 1fr; }
}

.card {
    background: var(--bg2);
    border-radius: var(--radius);
    padding: 1.25rem;
    box-shadow: var(--shadow);
}
.card h2 {
    font-size: .85rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .05em;
    color: var(--c2);
    margin-bottom: 1rem;
    padding-bottom: .5rem;
    border-bottom: 1px solid var(--bg3);
}

/* Win items */
.win-item {
    padding: .5rem .75rem;
    margin-bottom: .5rem;
    background: var(--win-bg);
    border-radius: 6px;
    border-left: 3px solid var(--win);
    font-size: .85rem;
}
.win-item .date {
    font-size: .7rem;
    color: var(--c3);
    margin-top: .15rem;
}

/* Goal items */
.goal-item {
    padding: .5rem 0;
    border-bottom: 1px solid var(--bg3);
    font-size: .85rem;
    display: flex;
    align-items: center;
    gap: .5rem;
}
.goal-item:last-child { border-bottom: none; }
.goal-item .status {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}
.goal-item .status.active { background: var(--goal-active); }
.goal-item .status.done { background: var(--goal-done); }
.goal-item .status.backlog { background: var(--goal-backlog); }
.goal-item.completed { opacity: .6; text-decoration: line-through; }

/* Goal level headers */
.goal-level {
    font-size: .75rem;
    font-weight: 600;
    color: var(--accent2);
    text-transform: uppercase;
    letter-spacing: .05em;
    margin-top: 1rem;
    margin-bottom: .5rem;
}
.goal-level:first-child { margin-top: 0; }

/* Project items */
.project-item {
    padding: .4rem 0;
    font-size: .85rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.project-item .badge {
    font-size: .65rem;
    padding: .15rem .5rem;
    border-radius: 4px;
    background: var(--bg3);
    color: var(--c2);
}

/* Area cards */
.area-card {
    background: var(--bg2);
    border-radius: var(--radius);
    padding: 1rem;
    box-shadow: var(--shadow);
    text-align: center;
}
.area-card h3 {
    font-size: .8rem;
    font-weight: 600;
    margin-bottom: .5rem;
}
.area-card .stat {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--accent);
}
.area-card .label {
    font-size: .65rem;
    color: var(--c3);
    text-transform: uppercase;
}
.area-card.neglected {
    border: 1px solid var(--danger);
    opacity: .7;
}

/* Stats bar */
.stats-bar {
    display: flex;
    gap: 2rem;
    padding: 1rem 0;
    margin-bottom: 1rem;
}
.stat-item .number {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--accent);
}
.stat-item .label {
    font-size: .7rem;
    color: var(--c3);
    text-transform: uppercase;
}

/* Bar chart (simple) */
.bar-chart {
    display: flex;
    flex-direction: column;
    gap: .4rem;
}
.bar-row {
    display: flex;
    align-items: center;
    gap: .5rem;
    font-size: .75rem;
}
.bar-row .bar-label {
    width: 120px;
    text-align: right;
    color: var(--c2);
    flex-shrink: 0;
}
.bar-row .bar {
    height: 16px;
    background: var(--accent);
    border-radius: 3px;
    min-width: 2px;
    transition: width .3s ease;
}
.bar-row .bar-value {
    color: var(--c3);
    font-size: .7rem;
    width: 30px;
}

/* Vision items */
.vision-item {
    padding: .5rem 0;
    font-size: .85rem;
    color: var(--accent2);
    border-bottom: 1px solid var(--bg3);
}
.vision-item:last-child { border-bottom: none; }

/* Footer */
.footer {
    text-align: center;
    padding: 2rem;
    font-size: .7rem;
    color: var(--c3);
}
.footer button {
    background: var(--bg2);
    border: 1px solid var(--bg3);
    color: var(--c2);
    padding: .4rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: .7rem;
    margin-top: .5rem;
}
.footer button:hover {
    background: var(--bg3);
}
    </style>
</head>
<body>
    <div class="header">
        <h1>Intentional Life OS — {{VIEW_TYPE}}</h1>
        <div class="meta">{{USER_NAME}} · Generated {{GENERATED_AT}}</div>
    </div>

    <div class="dashboard" id="dashboard"></div>

    <div class="footer">
        <div>Intentional Life OS · PARACELSUS Dashboard</div>
        <button onclick="window.print()">Export PDF</button>
    </div>

    <script>
    const DATA = {{DATA}};
    const VIEW = '{{VIEW_TYPE}}';

    // Render functions per view type
    const renderers = {
        overview: renderOverview,
        weekly: renderWeekly,
        goals: renderGoals,
        areas: renderAreas,
        wins: renderWins,
    };

    function el(tag, cls, html) {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        if (html) e.innerHTML = html;
        return e;
    }

    function card(title, content) {
        const c = el('div', 'card');
        c.innerHTML = `<h2>${title}</h2>`;
        if (typeof content === 'string') c.innerHTML += content;
        else c.appendChild(content);
        return c;
    }

    function renderWinList(wins, limit) {
        const items = (limit ? wins.slice(0, limit) : wins);
        return items.map(w =>
            `<div class="win-item">${w.title}<div class="date">${w.date || ''}</div></div>`
        ).join('') || '<div style="color:var(--c3);font-size:.85rem">No wins yet. Run /win to capture one.</div>';
    }

    function renderGoalList(goals, level) {
        if (!goals || !goals.length) return '';
        let html = `<div class="goal-level">${level}</div>`;
        html += goals.map(g =>
            `<div class="goal-item ${g.done ? 'completed' : ''}">
                <span class="status ${g.done ? 'done' : 'active'}"></span>
                ${g.title}
            </div>`
        ).join('');
        return html;
    }

    function renderOverview() {
        const d = document.getElementById('dashboard');
        d.className = 'dashboard grid-3';

        // Goals cascade
        let goalsHtml = '';
        if (DATA.goals) {
            goalsHtml += renderGoalList(DATA.goals.annual, 'Annual');
            goalsHtml += renderGoalList(DATA.goals.quarterly, 'Quarterly');
            goalsHtml += renderGoalList(DATA.goals.monthly, 'Monthly');
            goalsHtml += renderGoalList(DATA.goals.weekly, 'Weekly');
        }
        d.appendChild(card('Goals', goalsHtml || 'No active goals.'));

        // Wins
        const winCount = DATA.wins ? DATA.wins.length : 0;
        d.appendChild(card(`Wins (${winCount})`, renderWinList(DATA.wins || [], 10)));

        // Projects + Vision
        let rightHtml = '';
        if (DATA.projects && DATA.projects.length) {
            rightHtml += '<div class="goal-level">Active Projects</div>';
            rightHtml += DATA.projects.map(p =>
                `<div class="project-item">${p.title}<span class="badge">${p.status}</span></div>`
            ).join('');
        }
        if (DATA.vision && DATA.vision.hhgs && DATA.vision.hhgs.length) {
            rightHtml += '<div class="goal-level" style="margin-top:1.5rem">High Hard Goals</div>';
            rightHtml += DATA.vision.hhgs.map(h =>
                `<div class="vision-item">${h.title}</div>`
            ).join('');
        }
        d.appendChild(card('Projects & Vision', rightHtml || 'No active projects.'));
    }

    function renderWeekly() {
        const d = document.getElementById('dashboard');
        d.className = 'dashboard grid-2';

        let goalsHtml = renderGoalList(DATA.goals ? DATA.goals.weekly : [], 'Weekly Goals');
        d.appendChild(card('Goals & Tasks', goalsHtml || 'No weekly goals set. Run /weekly-review.'));

        d.appendChild(card(`Wins (${(DATA.wins||[]).length})`, renderWinList(DATA.wins || [])));
    }

    function renderGoals() {
        const d = document.getElementById('dashboard');
        d.className = 'dashboard grid-1';

        let html = '';
        if (DATA.vision && DATA.vision.hhgs) {
            html += '<div class="goal-level">High Hard Goals (Vision)</div>';
            html += DATA.vision.hhgs.map(h => `<div class="vision-item">${h.title}</div>`).join('');
        }
        if (DATA.goals) {
            html += renderGoalList(DATA.goals.annual, 'Annual Goals');
            html += renderGoalList(DATA.goals.quarterly, 'Quarterly Goals');
            html += renderGoalList(DATA.goals.monthly, 'Monthly Goals');
            html += renderGoalList(DATA.goals.weekly, 'Weekly Goals');
        }
        d.appendChild(card('Goal Cascade', html || 'No goals found.'));
    }

    function renderAreas() {
        const d = document.getElementById('dashboard');
        d.className = 'dashboard grid-4x3';
        if (!DATA.areas || !DATA.areas.length) {
            d.appendChild(card('Areas', 'No areas found. Run setup to populate structure-map.md.'));
            return;
        }
        DATA.areas.forEach(a => {
            const c = el('div', `area-card ${a.winCount === 0 && a.projectCount === 0 ? 'neglected' : ''}`);
            c.innerHTML = `
                <h3>${a.title}</h3>
                <div class="stat">${a.winCount}</div>
                <div class="label">wins (90 days)</div>
                <div style="margin-top:.5rem;font-size:.75rem;color:var(--c2)">
                    ${a.projectCount} project${a.projectCount !== 1 ? 's' : ''}
                    ${a.hasGoal ? ' · has goal' : ''}
                </div>
            `;
            d.appendChild(c);
        });
    }

    function renderWins() {
        const d = document.getElementById('dashboard');
        d.className = 'dashboard grid-2';

        // Timeline
        d.appendChild(card(`Win Timeline (${(DATA.wins||[]).length})`, renderWinList(DATA.wins || [])));

        // Stats sidebar
        const wins = DATA.wins || [];
        const areaCount = {};
        wins.forEach(w => {
            const a = w.area || 'Uncategorized';
            areaCount[a] = (areaCount[a] || 0) + 1;
        });
        const maxCount = Math.max(...Object.values(areaCount), 1);
        let barHtml = '<div class="bar-chart">';
        Object.entries(areaCount)
            .sort((a, b) => b[1] - a[1])
            .forEach(([area, count]) => {
                const pct = (count / maxCount) * 100;
                barHtml += `<div class="bar-row">
                    <span class="bar-label">${area}</span>
                    <div class="bar" style="width:${pct}%"></div>
                    <span class="bar-value">${count}</span>
                </div>`;
            });
        barHtml += '</div>';

        const statsHtml = `
            <div class="stats-bar">
                <div class="stat-item"><div class="number">${wins.length}</div><div class="label">Total Wins</div></div>
                <div class="stat-item"><div class="number">${(wins.length / 13).toFixed(1)}</div><div class="label">Per Week</div></div>
            </div>
            ${barHtml}
        `;
        d.appendChild(card('Win Breakdown', statsHtml));
    }

    // Render the chosen view
    (renderers[VIEW] || renderers.overview)();
    </script>
</body>
</html>
```

## Customization

When generating the dashboard:

1. **Replace placeholders** before writing:
   - `{{DATA}}` -> JavaScript object literal (NOT JSON string -- no quotes around it)
   - `{{VIEW_TYPE}}` -> One of: overview, weekly, goals, areas, wins
   - `{{GENERATED_AT}}` -> Current date/time string
   - `{{USER_NAME}}` -> User's name from personal context

2. **Colors can be adjusted** via CSS custom properties in `:root`. The cosmic theme uses warm golds and earth tones.

3. **Additional sections** can be added by extending the render functions.

4. **The template is a starting point.** Feel free to modify the layout, add chart libraries from CDN, or customize the styling based on user preferences.
