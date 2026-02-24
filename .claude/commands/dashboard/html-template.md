# ILOS Dashboard — HTML Template

Self-contained Single-Page Application for the Intentional Life OS dashboard. Zero external dependencies. Hash-based routing with 4 views: Dashboard, Areas, Goals, Wins.

## Placeholders

DAEDALUS replaces these before writing the final `.html` file:

| Placeholder | Type | Description |
|-------------|------|-------------|
| `{{DATA}}` | JS object literal | The complete DATA object (NOT a JSON string) |
| `{{GENERATED_AT}}` | String | ISO date-time of generation |
| `{{USER_NAME}}` | String | User's display name |

## Full Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ILOS Dashboard — {{USER_NAME}}</title>
<style>
/* ============================================================
   CSS Custom Properties
   ============================================================ */
:root {
  /* Element Colors */
  --fire: #ef6c00;   --fire-soft: #ef6c0022;
  --air: #0097a7;    --air-soft: #0097a722;
  --earth: #2e7d32;  --earth-soft: #2e7d3222;
  --water: #1565c0;  --water-soft: #1565c022;
  --ether: #9c27b0;  --ether-soft: #9c27b022;

  /* Light Theme */
  --bg: #f8f7f4;
  --bg2: #ffffff;
  --bg3: #f0eeeb;
  --c1: #1a1816;
  --c2: #6b635a;
  --c3: #a8a29e;
  --shadow: 0 1px 3px rgba(0,0,0,.04), 0 4px 12px rgba(0,0,0,.06);

  /* Layout */
  --sidebar-w: 56px;
  --sidebar-w-expanded: 200px;
  --font: system-ui, -apple-system, 'Segoe UI', sans-serif;
  --radius: 10px;
}

/* Dark Theme */
[data-theme="dark"] {
  --bg: #0f0e0d;
  --bg2: #1a1918;
  --bg3: #242220;
  --c1: #f5f3f0;
  --c2: #a8a29e;
  --c3: #6b635a;
  --shadow: 0 1px 3px rgba(0,0,0,.2), 0 4px 12px rgba(0,0,0,.3);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #0f0e0d;
    --bg2: #1a1918;
    --bg3: #242220;
    --c1: #f5f3f0;
    --c2: #a8a29e;
    --c3: #6b635a;
    --shadow: 0 1px 3px rgba(0,0,0,.2), 0 4px 12px rgba(0,0,0,.3);
  }
}

/* ============================================================
   Reset & Base
   ============================================================ */
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: var(--font);
  background: var(--bg);
  color: var(--c1);
  line-height: 1.5;
  min-height: 100dvh;
  display: flex;
}

/* ============================================================
   Sidebar (Desktop)
   ============================================================ */
.sidebar {
  position: fixed; top: 0; left: 0; bottom: 0;
  width: var(--sidebar-w);
  background: var(--bg2);
  border-right: 1px solid var(--bg3);
  display: flex; flex-direction: column;
  z-index: 100;
  transition: width .25s ease;
  overflow: hidden;
}
.sidebar:hover { width: var(--sidebar-w-expanded); }
.sidebar .brand {
  height: 56px; display: flex; align-items: center;
  padding: 0 16px; white-space: nowrap;
  font-weight: 700; font-size: .85rem; color: var(--ether);
  border-bottom: 1px solid var(--bg3);
}
.sidebar .brand .brand-text { opacity: 0; margin-left: 10px; transition: opacity .2s; }
.sidebar:hover .brand .brand-text { opacity: 1; }

.sidebar nav { flex: 1; padding: 8px 0; }
.sidebar nav a {
  display: flex; align-items: center; gap: 12px;
  height: 44px; padding: 0 16px;
  text-decoration: none; color: var(--c2);
  font-size: .85rem; white-space: nowrap;
  border-left: 3px solid transparent;
  transition: background .15s, border-color .15s, color .15s;
}
.sidebar nav a:hover { background: var(--bg3); color: var(--c1); }
.sidebar nav a.active { border-left-color: var(--ether); background: var(--ether-soft); color: var(--c1); font-weight: 600; }
.sidebar nav a .icon { width: 24px; text-align: center; font-size: 1.1rem; flex-shrink: 0; }
.sidebar nav a .label { opacity: 0; transition: opacity .2s; }
.sidebar:hover nav a .label { opacity: 1; }

.sidebar .sidebar-footer {
  padding: 12px 16px; border-top: 1px solid var(--bg3);
  display: flex; align-items: center; gap: 10px;
}
.sidebar .sidebar-footer .label { opacity: 0; transition: opacity .2s; font-size: .75rem; color: var(--c3); }
.sidebar:hover .sidebar-footer .label { opacity: 1; }

#theme-toggle {
  background: none; border: 1px solid var(--bg3); border-radius: 6px;
  width: 32px; height: 32px; cursor: pointer; font-size: 1rem;
  color: var(--c2); display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
#theme-toggle:hover { background: var(--bg3); }

/* ============================================================
   Main Content
   ============================================================ */
.main {
  margin-left: var(--sidebar-w);
  flex: 1; min-height: 100dvh;
  display: flex; flex-direction: column;
}
.main-header {
  padding: 20px 28px 16px;
  border-bottom: 1px solid var(--bg3);
  display: flex; justify-content: space-between; align-items: baseline;
}
.main-header h1 { font-size: 1.35rem; font-weight: 700; }
.main-header .meta { font-size: .75rem; color: var(--c3); }
#content { flex: 1; padding: 24px 28px 80px; max-width: 1280px; width: 100%; }

/* ============================================================
   VPER Mini-Indicator (fixed bottom-right)
   ============================================================ */
.vper-mini {
  position: fixed; bottom: 16px; right: 16px;
  background: var(--bg2); border: 1px solid var(--bg3);
  border-radius: 12px; padding: 8px 14px;
  display: flex; align-items: center; gap: 8px;
  box-shadow: var(--shadow); z-index: 90;
  font-size: .75rem; color: var(--c2);
}
.vper-mini .dot {
  width: 10px; height: 10px; border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: .7; }
}

/* ============================================================
   Cards
   ============================================================ */
.card {
  background: var(--bg2);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow);
}
.card-title {
  font-size: .8rem; font-weight: 600; text-transform: uppercase;
  letter-spacing: .04em; color: var(--c2);
  margin-bottom: 14px; padding-bottom: 8px;
  border-bottom: 1px solid var(--bg3);
}

/* ============================================================
   Grid Layouts
   ============================================================ */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.grid-4x3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.top-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
.mid-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
.stats-bar {
  display: flex; gap: 32px; padding: 14px 20px;
  background: var(--bg2); border-radius: var(--radius);
  box-shadow: var(--shadow);
}
.stat-item .number { font-size: 1.4rem; font-weight: 700; color: var(--ether); }
.stat-item .label { font-size: .65rem; color: var(--c3); text-transform: uppercase; letter-spacing: .03em; }

/* ============================================================
   Area Cards
   ============================================================ */
.area-card {
  background: var(--bg2); border-radius: var(--radius);
  padding: 16px; box-shadow: var(--shadow);
  border-left: 4px solid var(--c3);
  display: flex; flex-direction: column; gap: 10px;
}
.area-card.neglected { opacity: .6; border-left-style: dashed; }
.area-card .area-header { display: flex; justify-content: space-between; align-items: flex-start; }
.area-card .area-name { font-size: .85rem; font-weight: 600; }
.area-card .area-meta { display: flex; align-items: center; gap: 12px; font-size: .75rem; color: var(--c2); }
.win-badge {
  display: inline-flex; align-items: center; gap: 4px;
  background: var(--earth-soft); color: var(--earth);
  padding: 2px 8px; border-radius: 10px; font-size: .7rem; font-weight: 600;
}

/* ============================================================
   Goal Items
   ============================================================ */
.goal-section { margin-bottom: 20px; }
.goal-section-title {
  font-size: .75rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: .05em; margin-bottom: 8px; padding: 4px 0;
  display: flex; align-items: center; gap: 8px;
}
.goal-item {
  padding: 8px 12px; margin-bottom: 6px;
  border-radius: 6px; font-size: .85rem;
  display: flex; align-items: flex-start; gap: 10px;
  background: var(--bg3);
}
.goal-item .status-dot {
  width: 8px; height: 8px; border-radius: 50%;
  flex-shrink: 0; margin-top: 6px;
}
.goal-item .goal-text { flex: 1; }
.goal-item .area-badge {
  font-size: .65rem; padding: 1px 8px; border-radius: 8px;
  font-weight: 600; flex-shrink: 0;
}
.progress-bar {
  height: 6px; background: var(--bg3); border-radius: 3px;
  margin-top: 4px; overflow: hidden;
}
.progress-bar .fill { height: 100%; border-radius: 3px; transition: width .3s ease; }
.kr-label { font-size: .7rem; color: var(--c3); margin-top: 2px; display: flex; justify-content: space-between; }
.goal-children { margin-left: 20px; border-left: 2px solid var(--bg3); padding-left: 12px; }

/* ============================================================
   Win Items
   ============================================================ */
.win-timeline-item {
  padding: 10px 14px; margin-bottom: 6px;
  border-left: 3px solid var(--earth);
  border-radius: 0 6px 6px 0;
  background: var(--earth-soft);
  font-size: .85rem;
}
.win-timeline-item .win-date { font-size: .7rem; color: var(--c3); margin-top: 2px; }
.win-timeline-item .win-area-badge {
  display: inline-block; font-size: .65rem; padding: 1px 7px;
  border-radius: 8px; margin-left: 6px; font-weight: 600;
}
.week-header {
  font-size: .8rem; font-weight: 700; color: var(--c2);
  margin: 18px 0 8px; padding-bottom: 4px;
  border-bottom: 1px solid var(--bg3);
}
.week-header:first-child { margin-top: 0; }
.empty-week { font-size: .8rem; color: var(--c3); padding: 6px 0; font-style: italic; }

/* ============================================================
   Filter Buttons
   ============================================================ */
.filter-bar { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.filter-btn {
  background: var(--bg2); border: 1px solid var(--bg3);
  padding: 5px 14px; border-radius: 16px; font-size: .75rem;
  cursor: pointer; color: var(--c2); font-weight: 500;
  transition: all .15s;
}
.filter-btn:hover { background: var(--bg3); }
.filter-btn.active { font-weight: 700; color: #fff; }

/* ============================================================
   Wins Analytics Sidebar
   ============================================================ */
.analytics-big-num { font-size: 2.2rem; font-weight: 800; color: var(--earth); }
.analytics-label { font-size: .7rem; color: var(--c3); text-transform: uppercase; margin-bottom: 12px; }
.analytics-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: .8rem; border-bottom: 1px solid var(--bg3); }
.analytics-row:last-child { border-bottom: none; }
.bar-chart-row {
  display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: .75rem;
}
.bar-chart-row .bar-label { width: 90px; text-align: right; color: var(--c2); flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bar-chart-row .bar-track { flex: 1; height: 14px; background: var(--bg3); border-radius: 3px; overflow: hidden; }
.bar-chart-row .bar-fill { height: 100%; border-radius: 3px; }
.bar-chart-row .bar-value { width: 28px; color: var(--c3); font-size: .7rem; text-align: right; }

/* ============================================================
   Responsive: Mobile (< 768px)
   ============================================================ */
@media (max-width: 767px) {
  .sidebar { display: none; }
  .main { margin-left: 0; }
  .mobile-bar {
    display: flex !important;
    position: fixed; bottom: 0; left: 0; right: 0;
    background: var(--bg2); border-top: 1px solid var(--bg3);
    z-index: 100; height: 56px;
  }
  .mobile-bar a {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-decoration: none; color: var(--c3); font-size: .6rem; gap: 2px;
  }
  .mobile-bar a .icon { font-size: 1.2rem; }
  .mobile-bar a.active { color: var(--ether); }
  #content { padding-bottom: 80px; }
  .top-row, .mid-row, .grid-2, .grid-3 { grid-template-columns: 1fr; }
  .grid-4x3 { grid-template-columns: 1fr 1fr; }
  .stats-bar { flex-wrap: wrap; gap: 16px; }
  .vper-mini { bottom: 64px; }
}

/* Hide mobile bar on desktop */
.mobile-bar { display: none; }

/* ============================================================
   Animations
   ============================================================ */
@keyframes pulse-ring {
  0% { stroke-opacity: 1; }
  50% { stroke-opacity: .5; }
  100% { stroke-opacity: 1; }
}
.vper-active-arc { animation: pulse-ring 2s ease-in-out infinite; }
</style>
</head>
<body>

<!-- Desktop Sidebar -->
<aside class="sidebar">
  <div class="brand">
    <span style="font-size:1.2rem">&#9672;</span>
    <span class="brand-text">ILOS</span>
  </div>
  <nav id="sidebar-nav"></nav>
  <div class="sidebar-footer">
    <button id="theme-toggle" title="Toggle theme">&#9788;</button>
    <span class="label">Theme</span>
  </div>
</aside>

<!-- Mobile Bottom Bar -->
<div class="mobile-bar" id="mobile-nav"></div>

<!-- Main Content -->
<div class="main">
  <div class="main-header">
    <h1 id="page-title">Dashboard</h1>
    <div class="meta">{{USER_NAME}} &middot; {{GENERATED_AT}}</div>
  </div>
  <div id="content"></div>
</div>

<!-- VPER Mini-Indicator -->
<div class="vper-mini" id="vper-mini"></div>

<script>
/* ============================================================
   DATA INJECTION
   ============================================================ */
const DATA = {{DATA}};

/* ============================================================
   ELEMENT / AREA UTILITIES
   ============================================================ */
const ELEMENT_COLORS = { fire: 'var(--fire)', earth: 'var(--earth)', air: 'var(--air)', water: 'var(--water)', ether: 'var(--ether)' };
const ELEMENT_SOFT   = { fire: 'var(--fire-soft)', earth: 'var(--earth-soft)', air: 'var(--air-soft)', water: 'var(--water-soft)', ether: 'var(--ether-soft)' };
const AREA_ELEMENT = {
  health: 'fire', creative: 'fire', vision: 'fire',
  finances: 'earth', routines: 'earth', career: 'earth',
  intellectual: 'air', love: 'air', social: 'air',
  home: 'water', emotional: 'water', spiritual: 'water'
};
const ELEMENT_AREAS = {
  fire: ['health','creative','vision'],
  earth: ['finances','routines','career'],
  air: ['intellectual','love','social'],
  water: ['home','emotional','spiritual']
};
const VPER_ELEMENT = { Vision: 'fire', Plan: 'air', Execute: 'earth', Review: 'water' };

function elColor(areaSlug) { return ELEMENT_COLORS[AREA_ELEMENT[areaSlug]] || 'var(--c3)'; }
function elSoft(areaSlug)  { return ELEMENT_SOFT[AREA_ELEMENT[areaSlug]] || 'var(--bg3)'; }
function statusColor(s) { return s === 'active' ? 'var(--earth)' : s === 'completed' ? 'var(--c3)' : s === 'abandoned' ? '#c1554d' : 'var(--c3)'; }

/* ============================================================
   ROUTER
   ============================================================ */
const ROUTES = {
  dashboard: { render: renderDashboard, icon: '\u25CE', label: 'Dashboard' },
  areas:     { render: renderAreas,     icon: '\u25EB', label: 'Areas' },
  goals:     { render: renderGoals,     icon: '\u25C8', label: 'Goals' },
  wins:      { render: renderWins,      icon: '\u2605', label: 'Wins' }
};

function buildNav() {
  const sideNav = document.getElementById('sidebar-nav');
  const mobileNav = document.getElementById('mobile-nav');
  let sideHTML = '', mobileHTML = '';
  for (const [key, r] of Object.entries(ROUTES)) {
    sideHTML += `<a href="#${key}" data-route="${key}"><span class="icon">${r.icon}</span><span class="label">${r.label}</span></a>`;
    mobileHTML += `<a href="#${key}" data-route="${key}"><span class="icon">${r.icon}</span>${r.label}</a>`;
  }
  sideNav.innerHTML = sideHTML;
  mobileNav.innerHTML = mobileHTML;
}

function navigate() {
  const hash = location.hash.slice(1) || 'dashboard';
  const route = ROUTES[hash] || ROUTES.dashboard;
  const el = document.getElementById('content');
  el.innerHTML = '';
  document.getElementById('page-title').textContent = route.label;
  route.render(el);
  updateActiveNav(hash);
}

function updateActiveNav(hash) {
  document.querySelectorAll('[data-route]').forEach(a => {
    a.classList.toggle('active', a.dataset.route === hash);
  });
}

window.addEventListener('hashchange', navigate);

/* ============================================================
   THEME TOGGLE
   ============================================================ */
function initTheme() {
  const stored = localStorage.getItem('ilos-theme');
  if (stored) document.documentElement.setAttribute('data-theme', stored);
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const isDark = current === 'dark' || (!current && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ilos-theme', next);
    document.getElementById('theme-toggle').innerHTML = next === 'dark' ? '&#9789;' : '&#9788;';
  });
}

/* ============================================================
   VPER MINI-INDICATOR
   ============================================================ */
function initVperMini() {
  const v = DATA.vper || {};
  const raw = v.phase || 'execute';
  const cap = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  const elem = VPER_ELEMENT[cap] || 'earth';
  document.getElementById('vper-mini').innerHTML =
    `<span class="dot" style="background:${ELEMENT_COLORS[elem]}"></span><strong>${cap}</strong> phase`;
}

/* ============================================================
   SVG GENERATORS
   ============================================================ */

/* A. VPER Wheel — 4-quadrant circle, 200px */
function svgVperWheel(phase) {
  const cx = 100, cy = 100, r = 85, ir = 40;
  const phaseCap = phase ? phase.charAt(0).toUpperCase() + phase.slice(1).toLowerCase() : '';
  const quads = [
    { name: 'Vision',  elem: 'fire',  startAngle: -90, endAngle: 0 },
    { name: 'Plan',    elem: 'air',   startAngle: -180, endAngle: -90 },
    { name: 'Execute', elem: 'earth', startAngle: 180, endAngle: -180 },
    { name: 'Review',  elem: 'water', startAngle: 90, endAngle: 180 }
  ];
  /* Convert degrees to rad */
  const rad = d => d * Math.PI / 180;
  /* Arc path for a quadrant */
  function arcPath(sa, ea, radius) {
    const x1 = cx + radius * Math.cos(rad(sa));
    const y1 = cy + radius * Math.sin(rad(sa));
    const x2 = cx + radius * Math.cos(rad(ea));
    const y2 = cy + radius * Math.sin(rad(ea));
    return `M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`;
  }
  /* Quadrant wedge path */
  function wedgePath(sa, ea) {
    const ox1 = cx + ir * Math.cos(rad(sa)), oy1 = cy + ir * Math.sin(rad(sa));
    const ox2 = cx + r * Math.cos(rad(sa)),  oy2 = cy + r * Math.sin(rad(sa));
    const ox3 = cx + r * Math.cos(rad(ea)),  oy3 = cy + r * Math.sin(rad(ea));
    const ox4 = cx + ir * Math.cos(rad(ea)), oy4 = cy + ir * Math.sin(rad(ea));
    return `M ${ox1} ${oy1} L ${ox2} ${oy2} A ${r} ${r} 0 0 1 ${ox3} ${oy3} L ${ox4} ${oy4} A ${ir} ${ir} 0 0 0 ${ox1} ${oy1} Z`;
  }
  /* Label positions */
  function labelPos(sa, ea) {
    const mid = (sa + ea) / 2;
    const lr = (r + ir) / 2;
    return { x: cx + lr * Math.cos(rad(mid)), y: cy + lr * Math.sin(rad(mid)) };
  }

  let paths = '';
  quads.forEach(q => {
    const isActive = q.name === phaseCap;
    const col = ELEMENT_COLORS[q.elem].replace('var(--','').replace(')','');
    const rawMap = { fire: '#ef6c00', air: '#0097a7', earth: '#2e7d32', water: '#1565c0' };
    const raw = rawMap[q.elem];
    const fill = isActive ? raw + '4D' : raw + '18';
    const stroke = isActive ? raw : raw + '66';
    const sw = isActive ? 3 : 1;
    paths += `<path d="${wedgePath(q.startAngle, q.endAngle)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${isActive ? 'class="vper-active-arc"' : ''}/>`;
    const lp = labelPos(q.startAngle, q.endAngle);
    const fw = isActive ? '700' : '500';
    const fs = isActive ? '11' : '10';
    paths += `<text x="${lp.x}" y="${lp.y}" text-anchor="middle" dominant-baseline="central" font-size="${fs}" font-weight="${fw}" fill="${raw}">${q.name}</text>`;
  });
  /* Center label */
  paths += `<text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="13" font-weight="800" fill="var(--c1)">${phaseCap}</text>`;
  paths += `<text x="${cx}" y="${cy + 10}" text-anchor="middle" font-size="9" fill="var(--c3)">CURRENT</text>`;

  return `<svg viewBox="0 0 200 200" width="200" height="200" style="display:block">${paths}</svg>`;
}

/* B. Elemental Balance Bar */
function svgElementalBar(balance) {
  if (!balance) return '<div style="color:var(--c3);font-size:.8rem">No elemental balance data.</div>';
  const elems = ['fire','air','earth','water'];
  const scores = elems.map(e => (balance[e] && balance[e].score) || 0);
  const total = scores.reduce((a,b) => a + b, 0) || 1;
  const rawColors = { fire: '#ef6c00', air: '#0097a7', earth: '#2e7d32', water: '#1565c0' };
  const minScore = Math.min(...scores);
  let bars = '', x = 0;
  const w = 400, h = 32;
  elems.forEach((e, i) => {
    const pct = scores[i] / total;
    const bw = pct * w;
    const isWeakest = scores[i] === minScore;
    bars += `<rect x="${x}" y="0" width="${bw}" height="${h}" fill="${rawColors[e]}" rx="0"/>`;
    if (bw > 30) {
      bars += `<text x="${x + bw/2}" y="${h/2 + 1}" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="600" fill="#fff">${scores[i]}</text>`;
    }
    if (isWeakest) {
      bars += `<rect x="${x}" y="0" width="${bw}" height="${h}" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="4 2"/>`;
    }
    x += bw;
  });
  /* Legend below */
  let legend = '';
  const lx = [0, 100, 200, 300];
  elems.forEach((e, i) => {
    legend += `<rect x="${lx[i]}" y="${h+8}" width="10" height="10" rx="2" fill="${rawColors[e]}"/>`;
    legend += `<text x="${lx[i]+14}" y="${h+17}" font-size="10" fill="var(--c2)">${e.charAt(0).toUpperCase()+e.slice(1)} ${balance[e] ? '('+balance[e].score+')' : ''}</text>`;
  });
  return `<svg viewBox="0 0 ${w} ${h+24}" width="100%" style="display:block;max-width:${w}px"><rect x="0" y="0" width="${w}" height="${h}" rx="6" fill="var(--bg3)"/>${bars}${legend}</svg>`;
}

/* C. Area Health Donut — 40px diameter */
function svgHealthDonut(score, elem) {
  const r = 16, circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score || 0));
  const dash = (pct / 100) * circ;
  const rawColors = { fire: '#ef6c00', air: '#0097a7', earth: '#2e7d32', water: '#1565c0' };
  const color = rawColors[elem] || '#a8a29e';
  return `<svg width="40" height="40" viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="${r}" fill="none" stroke="var(--bg3)" stroke-width="4"/>
    <circle cx="20" cy="20" r="${r}" fill="none" stroke="${color}" stroke-width="4"
      stroke-dasharray="${dash} ${circ}" stroke-linecap="round"
      transform="rotate(-90 20 20)"/>
    <text x="20" y="21" text-anchor="middle" dominant-baseline="central"
      font-size="10" font-weight="700" fill="var(--c1)">${pct}</text>
  </svg>`;
}

/* D. Win Sparkline — 4 data points, 60x20 */
function svgSparkline(data) {
  if (!data || data.length < 2) return '<svg width="60" height="20"></svg>';
  const w = 60, h = 20, pad = 4;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v / max) * (h - pad * 2));
    return { x, y };
  });
  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');
  const trend = data[data.length - 1] > data[0] ? '#2e7d32' : data[data.length - 1] < data[0] ? '#ef6c00' : '#a8a29e';
  const dots = pts.map(p => `<circle cx="${p.x}" cy="${p.y}" r="2" fill="${trend}"/>`).join('');
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <polyline points="${polyline}" fill="none" stroke="${trend}" stroke-width="1.5"/>
    ${dots}
  </svg>`;
}

/* E. Goal Progress Bar */
function htmlProgressBar(current, target, areaSlug) {
  const pct = target > 0 ? Math.round((current / target) * 100) : 0;
  const color = elColor(areaSlug);
  return `<div class="progress-bar"><div class="fill" style="width:${Math.min(pct,100)}%;background:${color}"></div></div>
    <div class="kr-label"><span>${current}/${target}</span><span>${pct}%</span></div>`;
}

/* Weekly trend bar chart (13 bars) for Wins page */
function svgWeeklyTrend(byWeek) {
  if (!byWeek || !byWeek.length) return '';
  const w = 260, h = 80, barW = 14, gap = 6;
  const max = Math.max(...byWeek.map(b => b.count), 1);
  let bars = '';
  byWeek.slice(-13).forEach((wk, i) => {
    const bh = (wk.count / max) * (h - 16);
    const x = i * (barW + gap);
    bars += `<rect x="${x}" y="${h - bh - 12}" width="${barW}" height="${bh}" rx="2" fill="var(--earth)"/>`;
    bars += `<text x="${x + barW/2}" y="${h - 2}" text-anchor="middle" font-size="7" fill="var(--c3)">${wk.week || ''}</text>`;
  });
  const totalW = byWeek.slice(-13).length * (barW + gap);
  return `<svg viewBox="0 0 ${totalW} ${h}" width="100%" style="max-width:${totalW}px;display:block">${bars}</svg>`;
}

/* ============================================================
   PAGE RENDERERS
   ============================================================ */

/* ---------- #dashboard ---------- */
function renderDashboard(container) {
  const vper = DATA.vper || {};
  const goals = DATA.goals || {};
  const wins = DATA.wins || [];
  const areas = DATA.areas || [];
  const wa = DATA.winAnalytics || {};

  /* Top row: VPER Wheel + Elemental Balance */
  const topRow = document.createElement('div');
  topRow.className = 'top-row';

  const vperCard = document.createElement('div');
  vperCard.className = 'card';
  vperCard.innerHTML = `<div class="card-title">VPER Cycle</div>
    <div style="display:flex;justify-content:center">${svgVperWheel(vper.phase || 'execute')}</div>`;
  topRow.appendChild(vperCard);

  const balCard = document.createElement('div');
  balCard.className = 'card';
  balCard.innerHTML = `<div class="card-title">Elemental Balance</div>${svgElementalBar(vper.elementalBalance)}`;
  topRow.appendChild(balCard);

  container.appendChild(topRow);

  /* Middle row: Goal Summary, Recent Wins, Area Mini-Grid */
  const midRow = document.createElement('div');
  midRow.className = 'mid-row';

  /* Goal Summary */
  const goalCard = document.createElement('div');
  goalCard.className = 'card';
  const countActive = (arr) => (arr || []).filter(g => g.status === 'active').length;
  const weeklyGoals = (goals.weekly || []).filter(g => g.status === 'active').slice(0, 3);
  let goalHTML = `<div class="card-title">Goals</div>
    <div style="display:flex;gap:16px;margin-bottom:12px;flex-wrap:wrap">
      <div><span style="font-size:1.2rem;font-weight:700;color:var(--ether)">${countActive(goals.annual)}</span><div style="font-size:.65rem;color:var(--c3)">ANNUAL</div></div>
      <div><span style="font-size:1.2rem;font-weight:700;color:var(--ether)">${countActive(goals.quarterly)}</span><div style="font-size:.65rem;color:var(--c3)">QUARTERLY</div></div>
      <div><span style="font-size:1.2rem;font-weight:700;color:var(--ether)">${countActive(goals.monthly)}</span><div style="font-size:.65rem;color:var(--c3)">MONTHLY</div></div>
      <div><span style="font-size:1.2rem;font-weight:700;color:var(--ether)">${countActive(goals.weekly)}</span><div style="font-size:.65rem;color:var(--c3)">WEEKLY</div></div>
    </div>`;
  if (weeklyGoals.length) {
    goalHTML += '<div style="font-size:.7rem;font-weight:600;text-transform:uppercase;color:var(--c3);margin-bottom:6px">Top Weekly Goals</div>';
    weeklyGoals.forEach(g => {
      goalHTML += `<div style="padding:4px 0;font-size:.82rem;border-bottom:1px solid var(--bg3);display:flex;align-items:center;gap:6px">
        <span style="width:6px;height:6px;border-radius:50%;background:var(--earth);flex-shrink:0"></span>${g.description || ''}</div>`;
    });
  }
  goalCard.innerHTML = goalHTML;
  midRow.appendChild(goalCard);

  /* Recent Wins */
  const winCard = document.createElement('div');
  winCard.className = 'card';
  let winHTML = '<div class="card-title">Recent Wins</div>';
  const recentWins = wins.slice(0, 5);
  if (recentWins.length) {
    recentWins.forEach(w => {
      const ac = AREA_ELEMENT[w.area] || '';
      winHTML += `<div style="padding:6px 8px;margin-bottom:4px;border-radius:5px;font-size:.82rem;background:var(--earth-soft);border-left:3px solid var(--earth)">
        ${w.title || w.description || ''}
        ${w.area ? `<span style="display:inline-block;font-size:.6rem;padding:1px 6px;border-radius:6px;margin-left:4px;background:${elSoft(w.area)};color:${elColor(w.area)};font-weight:600">${w.area}</span>` : ''}
        <div style="font-size:.65rem;color:var(--c3)">${w.date || ''}</div>
      </div>`;
    });
  } else {
    winHTML += '<div style="color:var(--c3);font-size:.82rem">No wins yet. Run /win to capture one.</div>';
  }
  winCard.innerHTML = winHTML;
  midRow.appendChild(winCard);

  /* Area Mini-Grid */
  const areaCard = document.createElement('div');
  areaCard.className = 'card';
  let areaHTML = '<div class="card-title">Key Areas</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">';
  const sortedAreas = [...areas].sort((a, b) => (a.houseNum || 0) - (b.houseNum || 0));
  sortedAreas.forEach(a => {
    const elem = AREA_ELEMENT[a.id] || a.element || '';
    const rawColors = { fire: '#ef6c00', air: '#0097a7', earth: '#2e7d32', water: '#1565c0' };
    const dotColor = (a.healthScore || 0) >= 50 ? (rawColors[elem] || '#a8a29e') : (a.healthScore || 0) >= 15 ? '#f9a825' : '#c1554d';
    areaHTML += `<div style="text-align:center;padding:6px 4px;border-radius:6px;background:var(--bg3)">
      <div style="width:8px;height:8px;border-radius:50%;background:${dotColor};margin:0 auto 3px"></div>
      <div style="font-size:.65rem;font-weight:600;color:var(--c2)">${(a.name || a.id || '').slice(0,10)}</div>
    </div>`;
  });
  areaHTML += '</div>';
  areaCard.innerHTML = areaHTML;
  midRow.appendChild(areaCard);

  container.appendChild(midRow);

  /* Bottom: Quick Stats Bar */
  const statsBar = document.createElement('div');
  statsBar.className = 'stats-bar';
  const totalGoals = [].concat(goals.annual||[], goals.quarterly||[], goals.monthly||[], goals.weekly||[]).filter(g => g.status === 'active').length;
  statsBar.innerHTML = `
    <div class="stat-item"><div class="number">${wa.total90d || wins.length || 0}</div><div class="label">Wins (90d)</div></div>
    <div class="stat-item"><div class="number">${wa.weeklyAvg != null ? wa.weeklyAvg : (wins.length / 13).toFixed(1)}</div><div class="label">Weekly Avg</div></div>
    <div class="stat-item"><div class="number">${wa.currentStreak || 0}</div><div class="label">Current Streak</div></div>
    <div class="stat-item"><div class="number">${totalGoals}</div><div class="label">Active Goals</div></div>`;
  container.appendChild(statsBar);
}

/* ---------- #areas ---------- */
function renderAreas(container) {
  const areas = DATA.areas || [];

  /* Header + Filters */
  const header = document.createElement('div');
  header.innerHTML = '<div style="font-size:1.1rem;font-weight:700;margin-bottom:12px">12 Key Areas</div>';
  const filterBar = document.createElement('div');
  filterBar.className = 'filter-bar';
  const filters = ['All','Fire','Earth','Air','Water'];
  const filterColors = { Fire: '#ef6c00', Earth: '#2e7d32', Air: '#0097a7', Water: '#1565c0' };
  filters.forEach(f => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (f === 'All' ? ' active' : '');
    btn.textContent = f;
    if (f !== 'All') btn.style.cssText = `border-color:${filterColors[f]}`;
    btn.addEventListener('click', () => {
      filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (f !== 'All') btn.style.cssText = `background:${filterColors[f]};color:#fff;border-color:${filterColors[f]}`;
      filterBar.querySelectorAll('.filter-btn').forEach(b => {
        if (!b.classList.contains('active') && b.textContent !== 'All') {
          b.style.cssText = `border-color:${filterColors[b.textContent]}`;
        }
      });
      renderAreaGrid(f === 'All' ? null : f.toLowerCase());
    });
    filterBar.appendChild(btn);
  });
  header.appendChild(filterBar);
  container.appendChild(header);

  const grid = document.createElement('div');
  grid.id = 'area-grid';
  container.appendChild(grid);

  function renderAreaGrid(filterElem) {
    const g = document.getElementById('area-grid');
    g.innerHTML = '';
    const elementOrder = ['fire','earth','air','water'];
    elementOrder.forEach(elem => {
      if (filterElem && elem !== filterElem) return;
      const slugs = ELEMENT_AREAS[elem];
      const elemAreas = slugs.map(s => areas.find(a => a.id === s)).filter(Boolean);
      if (!elemAreas.length) return;

      const rawColors = { fire: '#ef6c00', earth: '#2e7d32', air: '#0097a7', water: '#1565c0' };
      const rowLabel = document.createElement('div');
      rowLabel.style.cssText = `font-size:.75rem;font-weight:700;text-transform:uppercase;color:${rawColors[elem]};margin:16px 0 8px;letter-spacing:.04em`;
      rowLabel.textContent = elem.charAt(0).toUpperCase() + elem.slice(1);
      g.appendChild(rowLabel);

      const row = document.createElement('div');
      row.className = 'grid-4x3';
      elemAreas.forEach(a => {
        const isNeglected = (a.healthScore || 0) < 15;
        const card = document.createElement('div');
        card.className = 'area-card' + (isNeglected ? ' neglected' : '');
        card.style.borderLeftColor = rawColors[elem];
        card.innerHTML = `
          <div class="area-header">
            <div class="area-name">${a.name || a.id}</div>
            ${svgHealthDonut(a.healthScore, elem)}
          </div>
          <div class="area-meta">
            <span class="win-badge">${a.winCount90d || 0} wins</span>
            ${svgSparkline(a.winTrend)}
            <span style="font-size:.7rem;color:var(--c2)">${(a.activeGoals || []).length} goals</span>
          </div>`;
        row.appendChild(card);
      });
      g.appendChild(row);
    });
  }

  renderAreaGrid(null);
}

/* ---------- #goals ---------- */
function renderGoals(container) {
  const goals = DATA.goals || {};
  const vision = DATA.vision || {};

  /* HHGs Section */
  if (vision.hhgs && vision.hhgs.length) {
    const sec = document.createElement('div');
    sec.className = 'card';
    sec.style.marginBottom = '20px';
    sec.style.borderLeft = '4px solid var(--ether)';
    let html = '<div class="card-title" style="color:var(--ether)">High Hard Goals (Vision)</div>';
    vision.hhgs.forEach(h => {
      html += `<div style="padding:6px 0;font-size:.85rem;border-bottom:1px solid var(--bg3);display:flex;align-items:center;gap:8px">
        <span style="color:var(--ether);font-weight:700">\u25C8</span> ${h.title}
        ${h.timeframe ? `<span style="font-size:.65rem;color:var(--c3);margin-left:auto">${h.timeframe}</span>` : ''}
      </div>`;
    });
    sec.innerHTML = html;
    container.appendChild(sec);
  }

  /* Goal levels: Annual -> Quarterly -> Monthly -> Weekly */
  const levels = [
    { key: 'annual', label: 'Annual Goals', color: 'var(--fire)' },
    { key: 'quarterly', label: 'Quarterly Goals', color: 'var(--air)' },
    { key: 'monthly', label: 'Monthly Goals', color: 'var(--earth)' },
    { key: 'weekly', label: 'Weekly Goals', color: 'var(--water)' }
  ];

  levels.forEach(level => {
    const items = goals[level.key];
    if (!items || !items.length) return;

    const sec = document.createElement('div');
    sec.className = 'goal-section';
    let html = `<div class="goal-section-title" style="color:${level.color}">
      <span style="width:12px;height:3px;background:${level.color};border-radius:2px;display:inline-block"></span>
      ${level.label} (${items.filter(g=>g.status==='active').length} active)
    </div>`;

    items.forEach(g => {
      const area = g.area || '';
      html += `<div class="goal-item">
        <span class="status-dot" style="background:${statusColor(g.status)}"></span>
        <div class="goal-text">
          <div>${g.description || ''}</div>`;

      /* Key Results */
      if (g.keyResults && g.keyResults.length) {
        g.keyResults.forEach(kr => {
          html += `<div style="margin-top:6px">
            <div style="font-size:.75rem;color:var(--c2)">${kr.description || ''}</div>
            ${htmlProgressBar(kr.current || 0, kr.target || 1, area)}
          </div>`;
        });
      }

      /* Connected child goals (indented) */
      if (g.childGoals && g.childGoals.length) {
        html += '<div class="goal-children">';
        g.childGoals.forEach(cid => {
          /* Find child in lower level */
          const allGoals = [].concat(goals.quarterly||[], goals.monthly||[], goals.weekly||[]);
          const child = allGoals.find(c => c.id === cid);
          if (child) {
            html += `<div class="goal-item" style="background:transparent;padding:4px 0">
              <span class="status-dot" style="background:${statusColor(child.status)};width:6px;height:6px"></span>
              <span style="font-size:.8rem">${child.description || ''}</span>
            </div>`;
          }
        });
        html += '</div>';
      }

      html += `</div>`;
      if (area) {
        html += `<span class="area-badge" style="background:${elSoft(area)};color:${elColor(area)}">${area}</span>`;
      }
      html += '</div>';
    });

    sec.innerHTML = html;
    container.appendChild(sec);
  });

  if (!levels.some(l => goals[l.key] && goals[l.key].length) && !(vision.hhgs && vision.hhgs.length)) {
    container.innerHTML = '<div class="card"><div class="card-title">Goals</div><p style="color:var(--c3);font-size:.85rem">No goals found. Run /morning or /weekly-review to set goals.</p></div>';
  }
}

/* ---------- #wins ---------- */
function renderWins(container) {
  const wins = DATA.wins || [];
  const wa = DATA.winAnalytics || {};

  const layout = document.createElement('div');
  layout.className = 'grid-2';
  layout.style.gridTemplateColumns = '1fr 340px';

  /* Left: Win Timeline grouped by week */
  const timeline = document.createElement('div');
  timeline.className = 'card';
  let tlHTML = '<div class="card-title">Win Timeline</div>';

  if (wins.length) {
    /* Group wins by week */
    const weekMap = new Map();
    wins.forEach(w => {
      const d = new Date(w.date || Date.now());
      const dayOfYear = Math.floor((d - new Date(d.getFullYear(),0,1)) / 86400000);
      const weekNum = Math.ceil((dayOfYear + new Date(d.getFullYear(),0,1).getDay() + 1) / 7);
      const key = `${d.getFullYear()}-W${String(weekNum).padStart(2,'0')}`;
      if (!weekMap.has(key)) weekMap.set(key, []);
      weekMap.get(key).push(w);
    });

    /* Render week groups (newest first) */
    const sortedWeeks = [...weekMap.entries()].sort((a,b) => b[0].localeCompare(a[0]));
    sortedWeeks.forEach(([wk, wkWins]) => {
      tlHTML += `<div class="week-header">${wk}</div>`;
      wkWins.forEach(w => {
        const area = w.area || '';
        tlHTML += `<div class="win-timeline-item">
          ${w.title || w.description || ''}
          ${area ? `<span class="win-area-badge" style="background:${elSoft(area)};color:${elColor(area)}">${area}</span>` : ''}
          <div class="win-date">${w.date || ''}</div>
        </div>`;
      });
    });
  } else {
    tlHTML += '<div class="empty-week">No wins recorded yet.</div>';
  }
  timeline.innerHTML = tlHTML;
  layout.appendChild(timeline);

  /* Right: Win Analytics */
  const analytics = document.createElement('div');
  analytics.className = 'card';
  let anHTML = '<div class="card-title">Win Analytics</div>';

  /* Big number */
  anHTML += `<div class="analytics-big-num">${wa.total90d || wins.length}</div>
    <div class="analytics-label">Total Wins (90 days)</div>`;

  /* Stats rows */
  anHTML += `<div class="analytics-row"><span>Weekly Average</span><strong>${wa.weeklyAvg != null ? wa.weeklyAvg : (wins.length / 13).toFixed(1)}</strong></div>`;
  anHTML += `<div class="analytics-row"><span>Current Streak</span><strong>${wa.currentStreak || 0} weeks</strong></div>`;
  anHTML += `<div class="analytics-row"><span>Longest Streak</span><strong>${wa.longestStreak || 0} weeks</strong></div>`;

  /* Area Breakdown Bar Chart */
  const byArea = wa.byArea || {};
  const areaEntries = Object.entries(byArea).sort((a,b) => (b[1].count||0) - (a[1].count||0));
  if (areaEntries.length) {
    anHTML += '<div style="margin-top:16px;font-size:.7rem;font-weight:600;text-transform:uppercase;color:var(--c3);margin-bottom:8px">By Area</div>';
    const maxCount = Math.max(...areaEntries.map(e => e[1].count || 0), 1);
    areaEntries.forEach(([slug, data]) => {
      const pct = ((data.count || 0) / maxCount) * 100;
      const rawColors = { fire: '#ef6c00', air: '#0097a7', earth: '#2e7d32', water: '#1565c0' };
      const elem = AREA_ELEMENT[slug] || '';
      const barColor = rawColors[elem] || '#a8a29e';
      anHTML += `<div class="bar-chart-row">
        <span class="bar-label">${slug}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${barColor}"></div></div>
        <span class="bar-value">${data.count || 0}</span>
      </div>`;
    });
  }

  /* Weekly Trend Chart */
  if (wa.byWeek && wa.byWeek.length) {
    anHTML += '<div style="margin-top:16px;font-size:.7rem;font-weight:600;text-transform:uppercase;color:var(--c3);margin-bottom:8px">Weekly Trend</div>';
    anHTML += svgWeeklyTrend(wa.byWeek);
  }

  analytics.innerHTML = anHTML;
  layout.appendChild(analytics);

  container.appendChild(layout);
}

/* ============================================================
   INIT
   ============================================================ */
buildNav();
initTheme();
initVperMini();
navigate();
</script>
</body>
</html>
```

## Customization

When generating the dashboard:

1. **Replace placeholders** before writing the `.html` file:
   - `{{DATA}}` -- JavaScript object literal (NOT a JSON string -- no quotes around it)
   - `{{GENERATED_AT}}` -- ISO date-time string (e.g., `"2026-02-23T14:30:00"`)
   - `{{USER_NAME}}` -- Display name from personal context

2. **Element colors** can be adjusted via the CSS custom properties in `:root`.

3. **The router** auto-navigates to `#dashboard` on load. Deep-link to any view by setting the hash (e.g., `file.html#wins`).

4. **Print/Export**: Use the browser's native print function. The layout degrades gracefully to single-column for print.

5. **Data shape reference**: See the full DATA schema in the skill spec (`SKILL.md` or the dashboard command definition).
