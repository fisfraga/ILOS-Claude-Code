'use strict';

/* ============================================================
   DATA — populated asynchronously from /api/data
   ============================================================ */
let DATA = {};

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
  dashboard:           { render: renderDashboard,          icon: '\u25CE', label: 'Dashboard',        nav: true  },
  alignment:           { render: renderAlignment,          icon: '\u221E', label: 'Alignment',         nav: true  },
  areas:               { render: renderAreas,              icon: '\u25EB', label: 'Areas',             nav: true  },
  goals:               { render: renderGoals,              icon: '\u25C8', label: 'Goals',             nav: true  },
  wins:                { render: renderWins,               icon: '\u2605', label: 'Wins',              nav: true  },
  learn:               { render: renderLearnHub,           icon: '\u25C9', label: 'Learn',             nav: true  },
  'learn/vper':        { render: renderLearnVper,          icon: '',       label: 'VPER Cycle',        nav: false },
  'learn/elements':    { render: renderLearnElements,      icon: '',       label: 'Elements',          nav: false },
  'learn/gap-to-gain': { render: renderLearnGapToGain,     icon: '',       label: 'Gap to Gain',       nav: false },
  'learn/areas':       { render: renderLearnAreas,         icon: '',       label: '12 Key Areas',      nav: false },
  'learn/goals':       { render: renderLearnGoals,         icon: '',       label: 'Goal Setting',      nav: false },
  'learn/planning':    { render: renderLearnPlanning,      icon: '',       label: 'Planning Cycle',    nav: false },
  'transits':          { render: renderTransitsAndCosmic,  icon: '\u263D', label: 'Transits & Cosmos', nav: true  },
  'systems':           { render: renderSystems,            icon: '\u21BB', label: 'Systems',           nav: true  }
};

function buildNav() {
  const sideNav   = document.getElementById('sidebar-nav');
  const mobileNav = document.getElementById('mobile-nav');
  let sideHTML = '', mobileHTML = '';
  for (const [key, r] of Object.entries(ROUTES)) {
    if (!r.nav) continue;
    sideHTML   += `<a href="#${key}" data-route="${key}"><span class="icon">${r.icon}</span><span class="label">${r.label}</span></a>`;
    mobileHTML += `<a href="#${key}" data-route="${key}"><span class="icon">${r.icon}</span>${r.label}</a>`;
  }
  sideNav.innerHTML   = sideHTML;
  mobileNav.innerHTML = mobileHTML;
}

function navigate() {
  const hash  = location.hash.slice(1) || 'dashboard';
  const route = ROUTES[hash] || ROUTES.dashboard;
  const el    = document.getElementById('content');
  el.innerHTML = '';
  document.getElementById('page-title').textContent = route.label;
  route.render(el);
  /* For nested routes like learn/vper, highlight the parent "learn" in nav */
  const navKey = hash.includes('/') ? hash.split('/')[0] : hash;
  updateActiveNav(navKey);
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
    const isDark  = current === 'dark' || (!current && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const next    = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ilos-theme', next);
    document.getElementById('theme-toggle').innerHTML = next === 'dark' ? '&#9789;' : '&#9788;';
  });
}

/* ============================================================
   VPER MINI-INDICATOR
   ============================================================ */
function initVperMini() {
  const v   = DATA.vper || {};
  const raw = v.phase || 'execute';
  const cap = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  const elem = VPER_ELEMENT[cap] || 'earth';
  document.getElementById('vper-mini').innerHTML =
    `<span class="dot" style="background:${ELEMENT_COLORS[elem]}"></span><strong>${cap}</strong> phase`;
}

/* ============================================================
   SVG GENERATORS
   ============================================================ */

/* A. VPER Wheel */
function svgVperWheel(phase) {
  const cx = 100, cy = 100, r = 85, ir = 40;
  const phaseCap = phase ? phase.charAt(0).toUpperCase() + phase.slice(1).toLowerCase() : '';
  const quads = [
    { name: 'Vision',  elem: 'fire',  startAngle: -90,  endAngle: 0   },
    { name: 'Plan',    elem: 'air',   startAngle: -180, endAngle: -90 },
    { name: 'Review',  elem: 'water', startAngle: 90,   endAngle: 180 },
    { name: 'Execute', elem: 'earth', startAngle: 0,    endAngle: 90  }
  ];
  const rad = d => d * Math.PI / 180;
  function wedgePath(sa, ea) {
    const ox1 = cx + ir * Math.cos(rad(sa)), oy1 = cy + ir * Math.sin(rad(sa));
    const ox2 = cx + r  * Math.cos(rad(sa)), oy2 = cy + r  * Math.sin(rad(sa));
    const ox3 = cx + r  * Math.cos(rad(ea)), oy3 = cy + r  * Math.sin(rad(ea));
    const ox4 = cx + ir * Math.cos(rad(ea)), oy4 = cy + ir * Math.sin(rad(ea));
    return `M ${ox1} ${oy1} L ${ox2} ${oy2} A ${r} ${r} 0 0 1 ${ox3} ${oy3} L ${ox4} ${oy4} A ${ir} ${ir} 0 0 0 ${ox1} ${oy1} Z`;
  }
  function labelPos(sa, ea) {
    const mid = (sa + ea) / 2;
    const lr  = (r + ir) / 2;
    return { x: cx + lr * Math.cos(rad(mid)), y: cy + lr * Math.sin(rad(mid)) };
  }
  const rawMap = { fire: '#ef6c00', air: '#0097a7', earth: '#2e7d32', water: '#1565c0' };
  let paths = '';
  quads.forEach(q => {
    const isActive = q.name === phaseCap;
    const raw      = rawMap[q.elem];
    const fill     = isActive ? raw + '4D' : raw + '18';
    const stroke   = isActive ? raw : raw + '66';
    paths += `<path d="${wedgePath(q.startAngle, q.endAngle)}" fill="${fill}" stroke="${stroke}" stroke-width="${isActive ? 3 : 1}"/>`;
    const lp = labelPos(q.startAngle, q.endAngle);
    paths += `<text x="${lp.x}" y="${lp.y}" text-anchor="middle" dominant-baseline="central" font-size="${isActive ? 11 : 10}" font-weight="${isActive ? 700 : 500}" fill="${raw}">${q.name}</text>`;
  });
  paths += `<text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="13" font-weight="800" fill="var(--c1)">${phaseCap}</text>`;
  paths += `<text x="${cx}" y="${cy + 10}" text-anchor="middle" font-size="9" fill="var(--c3)">CURRENT</text>`;
  return `<svg viewBox="0 0 200 200" width="200" height="200" style="display:block">${paths}</svg>`;
}

/* B. Elemental Balance Bar */
function svgElementalBar(balance) {
  if (!balance) return '<div style="color:var(--c3);font-size:.8rem">No elemental balance data.</div>';
  const elems     = ['fire','air','earth','water'];
  const scores    = elems.map(e => (balance[e] && balance[e].score) || 0);
  const total     = scores.reduce((a, b) => a + b, 0) || 1;
  const rawColors = { fire: '#ef6c00', air: '#0097a7', earth: '#2e7d32', water: '#1565c0' };
  const minScore  = Math.min(...scores);
  let bars = '', x = 0;
  const w = 400, h = 32;
  elems.forEach((e, i) => {
    const pct = scores[i] / total;
    const bw  = pct * w;
    bars += `<rect x="${x}" y="0" width="${bw}" height="${h}" fill="${rawColors[e]}" rx="0"/>`;
    if (bw > 30) bars += `<text x="${x + bw/2}" y="${h/2 + 1}" text-anchor="middle" dominant-baseline="central" font-size="11" font-weight="600" fill="#fff">${scores[i]}</text>`;
    if (scores[i] === minScore) bars += `<rect x="${x}" y="0" width="${bw}" height="${h}" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="4 2"/>`;
    x += bw;
  });
  let legend = '';
  const lx = [0, 100, 200, 300];
  elems.forEach((e, i) => {
    legend += `<rect x="${lx[i]}" y="${h+8}" width="10" height="10" rx="2" fill="${rawColors[e]}"/>`;
    legend += `<text x="${lx[i]+14}" y="${h+17}" font-size="10" fill="var(--c2)">${e.charAt(0).toUpperCase()+e.slice(1)} ${balance[e] ? '('+balance[e].score+')' : ''}</text>`;
  });
  return `<svg viewBox="0 0 ${w} ${h+24}" width="100%" style="display:block;max-width:${w}px"><rect x="0" y="0" width="${w}" height="${h}" rx="6" fill="var(--bg3)"/>${bars}${legend}</svg>`;
}

/* C. Area Health Donut — 40px */
function svgHealthDonut(score, elem) {
  const r    = 16, circ = 2 * Math.PI * r;
  const pct  = Math.max(0, Math.min(100, score || 0));
  const dash = (pct / 100) * circ;
  const rawColors = { fire: '#ef6c00', air: '#0097a7', earth: '#2e7d32', water: '#1565c0' };
  const color = rawColors[elem] || '#a8a29e';
  return `<svg width="40" height="40" viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="${r}" fill="none" stroke="var(--bg3)" stroke-width="4"/>
    <circle cx="20" cy="20" r="${r}" fill="none" stroke="${color}" stroke-width="4"
      stroke-dasharray="${dash} ${circ}" stroke-linecap="round" transform="rotate(-90 20 20)"/>
    <text x="20" y="21" text-anchor="middle" dominant-baseline="central" font-size="10" font-weight="700" fill="var(--c1)">${pct}</text>
  </svg>`;
}

/* D. Win Sparkline */
function svgSparkline(data) {
  if (!data || data.length < 2) return '<svg width="60" height="20"></svg>';
  const w = 60, h = 20, pad = 4;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (w - pad * 2),
    y: h - pad - ((v / max) * (h - pad * 2))
  }));
  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');
  const trend = data[data.length - 1] > data[0] ? '#2e7d32' : data[data.length - 1] < data[0] ? '#ef6c00' : '#a8a29e';
  const dots  = pts.map(p => `<circle cx="${p.x}" cy="${p.y}" r="2" fill="${trend}"/>`).join('');
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <polyline points="${polyline}" fill="none" stroke="${trend}" stroke-width="1.5"/>${dots}
  </svg>`;
}

/* E. Goal Progress Bar */
function htmlProgressBar(current, target, areaSlug) {
  const pct   = target > 0 ? Math.round((current / target) * 100) : 0;
  const color = elColor(areaSlug);
  return `<div class="progress-bar"><div class="fill" style="width:${Math.min(pct,100)}%;background:${color}"></div></div>
    <div class="kr-label"><span>${current}/${target}</span><span>${pct}%</span></div>`;
}

/* F. Weekly Trend Bar Chart */
function svgWeeklyTrend(byWeek) {
  if (!byWeek || !byWeek.length) return '';
  const w = 260, h = 80, barW = 14, gap = 6;
  const max = Math.max(...byWeek.map(b => b.count), 1);
  let bars = '';
  byWeek.slice(-13).forEach((wk, i) => {
    const bh = (wk.count / max) * (h - 16);
    const x  = i * (barW + gap);
    bars += `<rect x="${x}" y="${h - bh - 12}" width="${barW}" height="${bh}" rx="2" fill="var(--earth)"/>`;
    bars += `<text x="${x + barW/2}" y="${h - 2}" text-anchor="middle" font-size="7" fill="var(--c3)">${wk.week || ''}</text>`;
  });
  const totalW = byWeek.slice(-13).length * (barW + gap);
  return `<svg viewBox="0 0 ${totalW} ${h}" width="100%" style="max-width:${totalW}px;display:block">${bars}</svg>`;
}

/* ============================================================
   SHARED EDUCATIONAL HELPERS
   ============================================================ */

function renderBackLink(container) {
  const link = document.createElement('a');
  link.href = '#learn';
  link.className = 'back-link';
  link.innerHTML = '\u2190 Back to Learn';
  container.appendChild(link);
}

function renderEduSection(heading, contentHTML, elementColor, startExpanded) {
  const sec      = document.createElement('div');
  sec.className  = 'edu-section';
  if (elementColor) sec.style.borderLeft = `4px solid ${elementColor}`;
  const expanded = startExpanded !== false;
  sec.innerHTML  = `
    <div class="edu-section-header${expanded ? '' : ' collapsed'}" onclick="this.classList.toggle('collapsed');this.nextElementSibling.classList.toggle('hidden')">
      <span class="chevron">\u25BC</span> ${heading}
    </div>
    <div class="edu-section-body${expanded ? '' : ' hidden'}">${contentHTML}</div>`;
  return sec;
}

function renderQuoteCard(text, attribution) {
  return `<div class="quote-card">"${text}"${attribution ? `<div class="attribution">— ${attribution}</div>` : ''}</div>`;
}

function renderUserOverlay(label, contentHTML) {
  return `<div class="user-data-overlay"><div class="overlay-label">\u25C8 ${label}</div>${contentHTML}</div>`;
}

function renderFlowDiagram(steps, colors) {
  let html = '<div class="flow-diagram">';
  steps.forEach((s, i) => {
    const bg    = colors && colors[i] ? colors[i] : 'var(--bg2)';
    const color = colors && colors[i] ? '#fff' : 'var(--c1)';
    html += `<div class="flow-step" style="background:${bg};color:${color}">${s}</div>`;
    if (i < steps.length - 1) html += '<span class="flow-arrow">\u2192</span>';
  });
  return html + '</div>';
}

function renderCycleDiagram(steps, colors) {
  let html = '<div class="cycle-diagram">';
  steps.forEach((s, i) => {
    const bg     = colors && colors[i] ? colors[i] + '33' : 'var(--bg3)';
    const border = colors && colors[i] ? colors[i] : 'var(--c3)';
    html += `<div class="cycle-step" style="background:${bg};border:2px solid ${border}">${s}</div>`;
  });
  return html + '</div>';
}

function renderTabGroup(tabs) {
  const id = 'tg_' + Math.random().toString(36).slice(2, 8);
  let btnHTML = '<div class="tab-group">';
  let contentHTML = '';
  tabs.forEach((t, i) => {
    btnHTML += `<button class="tab-btn${i === 0 ? ' active' : ''}" onclick="
      this.parentElement.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
      this.classList.add('active');
      document.querySelectorAll('.${id}').forEach(c=>c.classList.remove('active'));
      document.getElementById('${id}_${i}').classList.add('active');
    ">${t.label}</button>`;
    contentHTML += `<div id="${id}_${i}" class="tab-content ${id}${i === 0 ? ' active' : ''}">${t.content}</div>`;
  });
  return btnHTML + '</div>' + contentHTML;
}

const RAW_ELEM_COLORS = { fire: '#ef6c00', air: '#0097a7', earth: '#2e7d32', water: '#1565c0', ether: '#9c27b0' };

/* ============================================================
   ILOS TRANSIT CONSTANTS
   ============================================================ */
const ILOS_KEY_AREAS = [
  'Health & Vitality','Finances & Resources','Intellectual & Communication','Home & Foundation',
  'Creative Expression','Routines & Service','Love & Partnership','Emotional Depth',
  'Vision & Expansion','Career & Legacy','Social & Community','Spiritual & Transcendence'
];
const SIGN_TO_HOUSE = {
  aries:1,taurus:2,gemini:3,cancer:4,leo:5,virgo:6,
  libra:7,scorpio:8,sagittarius:9,capricorn:10,aquarius:11,pisces:12
};
const SIGN_ELEMENT = {
  aries:'fire',taurus:'earth',gemini:'air',cancer:'water',leo:'fire',virgo:'earth',
  libra:'air',scorpio:'water',sagittarius:'fire',capricorn:'earth',aquarius:'air',pisces:'water'
};
const SIGN_VPER = {
  aries:'vision',taurus:'execute',gemini:'plan',cancer:'review',leo:'vision',virgo:'execute',
  libra:'plan',scorpio:'review',sagittarius:'vision',capricorn:'execute',aquarius:'plan',pisces:'review'
};

function getCosmicVperSummary(positions) {
  const counts = { vision: 0, plan: 0, execute: 0, review: 0 };
  const activeAreas = [];
  positions.forEach(p => {
    const phase = SIGN_VPER[p.sign] || 'execute';
    counts[phase]++;
    const houseNum = SIGN_TO_HOUSE[p.sign] || 1;
    activeAreas.push({ houseNum, areaName: ILOS_KEY_AREAS[houseNum - 1], planet: p.name, element: SIGN_ELEMENT[p.sign] || 'earth' });
  });
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  return { dominantPhase: dominant, phaseCounts: counts, activeAreas };
}

function getElementalWeather(positions) {
  const counts = { fire: 0, air: 0, earth: 0, water: 0 };
  positions.forEach(p => { counts[SIGN_ELEMENT[p.sign] || 'earth']++; });
  const sorted   = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const dominant = sorted[0][0];
  const weakest  = sorted[sorted.length - 1][0];
  const summaries = {
    fire:  'Strong Fire energy \u2014 ideal for vision, creativity, and bold action',
    air:   'Strong Air energy \u2014 ideal for planning, communication, and new ideas',
    earth: 'Strong Earth energy \u2014 ideal for execution, grounding, and building',
    water: 'Heavy Water energy \u2014 ideal for review, emotional processing, and reflection'
  };
  return { ...counts, dominant, weakest, summary: summaries[dominant] };
}

/* ============================================================
   PAGE RENDERERS
   ============================================================ */

/* ---------- #dashboard ---------- */
function renderDashboard(container) {
  const vper  = DATA.vper  || {};
  const goals = DATA.goals || {};
  const wins  = DATA.wins  || [];
  const areas = DATA.areas || [];
  const wa    = DATA.winAnalytics || {};

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

  /* Middle row */
  const midRow = document.createElement('div');
  midRow.className = 'mid-row';

  /* Goal Summary */
  const goalCard = document.createElement('div');
  goalCard.className = 'card';
  const countActive  = (arr) => (arr || []).filter(g => g.status === 'active').length;
  const weeklyGoals  = (goals.weekly || []).filter(g => g.status === 'active').slice(0, 3);
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
  const rawColors  = { fire: '#ef6c00', air: '#0097a7', earth: '#2e7d32', water: '#1565c0' };
  [...areas].sort((a, b) => (a.houseNum || 0) - (b.houseNum || 0)).forEach(a => {
    const elem     = AREA_ELEMENT[a.id] || a.element || '';
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

  /* Mini-Cards: Systems + Alignment */
  const miniRow = document.createElement('div');
  miniRow.className = 'grid-2';
  miniRow.style.marginBottom = '20px';

  const sysScore = (DATA.systemsAnalytics || {}).overallScore;
  const sysNeeds = (DATA.systemsAnalytics || {}).needsAttention || 0;
  if (sysScore != null) {
    const sysMini = document.createElement('div');
    sysMini.className = 'card';
    sysMini.style.cursor = 'pointer';
    sysMini.onclick = () => { location.hash = 'systems'; };
    const sysColor = sysScore >= 80 ? RAW_ELEM_COLORS.earth : sysScore >= 60 ? '#f9a825' : '#c1554d';
    sysMini.innerHTML = `<div class="card-title">Systems</div>
      <div style="display:flex;align-items:center;gap:12px">
        <span style="font-size:1.6rem;font-weight:800;color:${sysColor}">${sysScore}</span>
        <div><div style="font-size:.7rem;color:var(--c3)">EXECUTION SCORE</div>
        ${sysNeeds > 0 ? `<div style="font-size:.7rem;color:#c1554d">${sysNeeds} need attention</div>` : '<div style="font-size:.7rem;color:var(--earth)">All systems on track</div>'}</div>
      </div>`;
    miniRow.appendChild(sysMini);
  }

  const alignScore = (DATA.alignment || {}).overallScore;
  if (alignScore != null) {
    const alMini = document.createElement('div');
    alMini.className = 'card';
    alMini.style.cursor = 'pointer';
    alMini.onclick = () => { location.hash = 'alignment'; };
    const alColor = alignScore >= 80 ? RAW_ELEM_COLORS.earth : alignScore >= 60 ? '#f9a825' : '#c1554d';
    alMini.innerHTML = `<div class="card-title">Alignment</div>
      <div style="display:flex;align-items:center;gap:12px">
        <span style="font-size:1.6rem;font-weight:800;color:${alColor}">${alignScore}</span>
        <div style="font-size:.7rem;color:var(--c3)">ALIGNMENT SCORE</div>
      </div>`;
    miniRow.appendChild(alMini);
  }

  if (miniRow.children.length) container.appendChild(miniRow);

  /* Stats Bar */
  const statsBar = document.createElement('div');
  statsBar.className = 'stats-bar';
  const totalGoals = [].concat(goals.annual||[], goals.quarterly||[], goals.monthly||[], goals.weekly||[]).filter(g => g.status === 'active').length;
  statsBar.innerHTML = `
    <div class="stat-item"><div class="number">${wa.total90d || wins.length || 0}</div><div class="label">Wins (90d)</div></div>
    <div class="stat-item"><div class="number">${wa.weeklyAvg != null ? wa.weeklyAvg : (wins.length / 13).toFixed(1)}</div><div class="label">Weekly Avg</div></div>
    <div class="stat-item"><div class="number">${wa.currentStreak || 0}</div><div class="label">Week Streak</div></div>
    <div class="stat-item"><div class="number">${totalGoals}</div><div class="label">Active Goals</div></div>`;
  container.appendChild(statsBar);
}

/* ---------- #areas ---------- */
const AREA_DESC = {
  health:      'Physical body, energy, self-image — how you show up',
  finances:    'Money, assets, security — what you build and value',
  intellectual:'Learning, communication, ideas — how you think and share',
  home:        'Family, roots, emotional base — where you feel safe',
  creative:    'Creativity, joy, romance — what brings you alive',
  routines:    'Daily habits, health routines — how you maintain yourself',
  love:        'Intimate relationships, partnerships, collaboration',
  emotional:   'Transformation, deep processes, inner resources',
  vision:      'Philosophy, big-picture worldview, expansion',
  career:      'Career, public role, legacy — your world contribution',
  social:      'Friends, networks, collective purpose — your tribe',
  spiritual:   'Spirituality, solitude, inner wisdom'
};

function renderAreas(container) {
  const areas = DATA.areas || [];

  const header = document.createElement('div');
  header.innerHTML = '<div style="font-size:1.1rem;font-weight:700;margin-bottom:12px">12 Key Areas</div>';
  const filterBar = document.createElement('div');
  filterBar.className = 'filter-bar';
  const filters      = ['All','Fire','Earth','Air','Water'];
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
        if (!b.classList.contains('active') && b.textContent !== 'All') b.style.cssText = `border-color:${filterColors[b.textContent]}`;
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
    const rawColors = { fire: '#ef6c00', earth: '#2e7d32', air: '#0097a7', water: '#1565c0' };
    ['fire','earth','air','water'].forEach(elem => {
      if (filterElem && elem !== filterElem) return;
      const elemAreas = ELEMENT_AREAS[elem].map(s => areas.find(a => a.id === s)).filter(Boolean);
      if (!elemAreas.length) return;

      const rowLabel = document.createElement('div');
      rowLabel.style.cssText = `font-size:.75rem;font-weight:700;text-transform:uppercase;color:${rawColors[elem]};margin:16px 0 8px;letter-spacing:.04em`;
      rowLabel.textContent = elem.charAt(0).toUpperCase() + elem.slice(1);
      g.appendChild(rowLabel);

      const row = document.createElement('div');
      row.className = 'grid-4x3';
      elemAreas.forEach(a => {
        const card = document.createElement('div');
        card.className = 'area-card' + ((a.healthScore || 0) < 15 ? ' neglected' : '');
        card.style.borderLeftColor = rawColors[elem];
        const firstGoal = (a.activeGoals || [])[0];
        const projectCount = a.projectCount || 0;
        card.innerHTML = `
          <div class="area-header">
            <div>
              <div class="area-name">${a.name || a.id}</div>
              <div style="font-size:.6rem;color:var(--c3)">House ${a.houseNum || ''} \u00B7 ${elem}</div>
            </div>
            ${svgHealthDonut(a.healthScore, elem)}
          </div>
          <div style="font-size:.72rem;color:var(--c2);margin:4px 0 6px;line-height:1.4">${AREA_DESC[a.id] || ''}</div>
          ${firstGoal ? `<div style="font-size:.7rem;padding:3px 6px;border-radius:4px;background:${rawColors[elem]}18;color:${rawColors[elem]};margin-bottom:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">\u25C8 ${firstGoal}</div>` : ''}
          <div class="area-meta">
            <span class="win-badge">${a.winCount90d || 0} wins</span>
            ${svgSparkline(a.winTrend)}
            ${projectCount > 0 ? `<span style="font-size:.65rem;color:var(--c3)">${projectCount} proj</span>` : ''}
            <span style="font-size:.65rem;color:var(--c2)">${(a.activeGoals || []).length} goals</span>
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
  const goals  = DATA.goals  || {};
  const vision = DATA.vision || {};

  if (vision.hhgs && vision.hhgs.length) {
    const sec = document.createElement('div');
    sec.className = 'card';
    sec.style.marginBottom = '20px';
    sec.style.borderLeft   = '4px solid var(--ether)';
    let html = `<div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--ether);margin-bottom:10px">High Hard Goals \u2014 Your Vision Horizon</div>`;
    vision.hhgs.forEach((h, i) => {
      html += `<div style="display:flex;align-items:baseline;gap:8px;padding:5px 0${i < vision.hhgs.length - 1 ? ';border-bottom:1px solid var(--bg3)' : ''}">
        <span style="font-size:.7rem;font-weight:800;color:var(--ether);flex-shrink:0">${i + 1}</span>
        <span style="font-size:.85rem;font-weight:500">${h.title}</span>
      </div>`;
    });
    sec.innerHTML = html;
    container.appendChild(sec);
  }

  const levels = [
    { key: 'annual',    label: 'Annual Goals',    color: 'var(--fire)'  },
    { key: 'quarterly', label: 'Quarterly Goals',  color: 'var(--air)'   },
    { key: 'monthly',   label: 'Monthly Goals',    color: 'var(--earth)' },
    { key: 'weekly',    label: 'Weekly Goals',     color: 'var(--water)' }
  ];

  levels.forEach(level => {
    const items = goals[level.key];
    if (!items || !items.length) return;

    const sec = document.createElement('div');
    sec.className = 'goal-section';
    let html = `<div class="goal-section-title" style="color:${level.color}">
      <span style="width:12px;height:3px;background:${level.color};border-radius:2px;display:inline-block"></span>
      ${level.label} (${items.filter(g => g.status === 'active').length} active)
    </div>`;

    items.forEach(g => {
      const area = g.area || '';
      html += `<div class="goal-item">
        <span class="status-dot" style="background:${statusColor(g.status)}"></span>
        <div class="goal-text"><div>${g.description || ''}</div>`;

      if (g.keyResults && g.keyResults.length) {
        g.keyResults.forEach(kr => {
          html += `<div style="margin-top:6px">
            <div style="font-size:.75rem;color:var(--c2)">${kr.description || ''}</div>
            ${htmlProgressBar(kr.current || 0, kr.target || 1, area)}
          </div>`;
        });
      }

      if (g.childGoals && g.childGoals.length) {
        html += '<div class="goal-children">';
        g.childGoals.forEach(cid => {
          const allGoals = [].concat(goals.quarterly||[], goals.monthly||[], goals.weekly||[]);
          const child    = allGoals.find(c => c.id === cid);
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
      if (area) html += `<span class="area-badge" style="background:${elSoft(area)};color:${elColor(area)}">${area}</span>`;
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
  const wa   = DATA.winAnalytics || {};

  const layout = document.createElement('div');
  layout.className = 'grid-2';
  layout.style.gridTemplateColumns = '1fr 340px';

  /* Left: Win Timeline grouped by week */
  const timeline = document.createElement('div');
  timeline.className = 'card';
  let tlHTML = '<div class="card-title">Win Timeline</div>';

  if (wins.length) {
    const weekMap = new Map();
    wins.forEach(w => {
      const d       = new Date(w.date || Date.now());
      const dayOfYear = Math.floor((d - new Date(d.getFullYear(),0,1)) / 86400000);
      const weekNum = Math.ceil((dayOfYear + new Date(d.getFullYear(),0,1).getDay() + 1) / 7);
      const key     = `${d.getFullYear()}-W${String(weekNum).padStart(2,'0')}`;
      if (!weekMap.has(key)) weekMap.set(key, []);
      weekMap.get(key).push(w);
    });
    [...weekMap.entries()].sort((a, b) => b[0].localeCompare(a[0])).forEach(([wk, wkWins]) => {
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
  let anHTML = `<div class="card-title">Win Analytics</div>
    <div class="analytics-big-num">${wa.total90d || wins.length}</div>
    <div class="analytics-label">Total Wins (90 days)</div>
    <div class="analytics-row"><span>Weekly Average</span><strong>${wa.weeklyAvg != null ? wa.weeklyAvg : (wins.length / 13).toFixed(1)}</strong></div>
    <div class="analytics-row"><span>Current Streak</span><strong>${wa.currentStreak || 0} week${(wa.currentStreak || 0) !== 1 ? 's' : ''}</strong></div>
    <div class="analytics-row"><span>Longest Streak</span><strong>${wa.longestStreak || 0} week${(wa.longestStreak || 0) !== 1 ? 's' : ''}</strong></div>`;

  const byArea      = wa.byArea || {};
  const areaEntries = Object.entries(byArea).sort((a, b) => (b[1].count||0) - (a[1].count||0));
  if (areaEntries.length) {
    anHTML += '<div style="margin-top:16px;font-size:.7rem;font-weight:600;text-transform:uppercase;color:var(--c3);margin-bottom:8px">By Area</div>';
    const maxCount  = Math.max(...areaEntries.map(e => e[1].count || 0), 1);
    const rawColors = { fire: '#ef6c00', air: '#0097a7', earth: '#2e7d32', water: '#1565c0' };
    areaEntries.forEach(([slug, data]) => {
      const pct      = ((data.count || 0) / maxCount) * 100;
      const barColor = rawColors[AREA_ELEMENT[slug]] || '#a8a29e';
      anHTML += `<div class="bar-chart-row">
        <span class="bar-label">${slug}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${barColor}"></div></div>
        <span class="bar-value">${data.count || 0}</span>
      </div>`;
    });
  }

  if (wa.byWeek && wa.byWeek.length) {
    anHTML += '<div style="margin-top:16px;font-size:.7rem;font-weight:600;text-transform:uppercase;color:var(--c3);margin-bottom:8px">Weekly Trend</div>';
    anHTML += svgWeeklyTrend(wa.byWeek);
  }

  analytics.innerHTML = anHTML;
  layout.appendChild(analytics);
  container.appendChild(layout);
}

/* ---------- #learn ---------- */
function renderLearnHub(container) {
  const topics = [
    { route: 'learn/vper',       icon: '\uD83D\uDD25', title: 'VPER Cycle',       desc: 'The four-phase cycle that drives all planning: Vision, Plan, Execute, Review.', element: 'fire'  },
    { route: 'learn/elements',   icon: '\u2728',       title: 'Elemental Wisdom', desc: 'Understand the four elements and find your elemental balance.',                  element: 'ether' },
    { route: 'learn/gap-to-gain',icon: '\uD83D\uDCA7', title: 'Gap to Gain',      desc: 'Measure progress against your past self, never against ideals.',                 element: 'water' },
    { route: 'learn/areas',      icon: '\u26F0',       title: '12 Key Areas',     desc: 'The complete framework mapping 12 life domains to zodiac houses.',               element: 'earth' },
    { route: 'learn/goals',      icon: '\uD83C\uDF2C', title: 'Goal Setting',     desc: 'The alignment chain from purpose down to daily actions.',                        element: 'air'   },
    { route: 'learn/planning',   icon: '\u2726',       title: 'Planning Cycle',   desc: 'Intentional planning as an ongoing process across time cycles.',                 element: 'ether' }
  ];

  const grid = document.createElement('div');
  grid.className = 'learn-grid';
  topics.forEach(t => {
    const card = document.createElement('div');
    card.className = 'learn-card';
    card.style.borderLeftColor = RAW_ELEM_COLORS[t.element] || 'var(--ether)';
    card.innerHTML = `
      <div class="learn-icon">${t.icon}</div>
      <div class="learn-title">${t.title}</div>
      <div class="learn-desc">${t.desc}</div>`;
    card.addEventListener('click', () => { location.hash = t.route; });
    grid.appendChild(card);
  });
  container.appendChild(grid);

  /* Technical System Guide */
  const sysGuide = renderEduSection('System Guide',
    `<div style="font-size:.82rem;line-height:1.7">
      <div style="font-weight:700;margin-bottom:8px;color:var(--c1)">How the Dashboard Works</div>
      <p>This dashboard is a live Node.js server that reads your YAML and JSONL files on every request. Refresh the browser after editing any data file to see the latest data.</p>
      <div style="font-weight:700;margin:12px 0 6px;color:var(--c1)">Key Data Files</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 16px">
        <div style="font-size:.75rem;color:var(--c3)">VPER + elemental balance</div><div style="font-size:.75rem;font-family:monospace">TIME/current-period.yaml</div>
        <div style="font-size:.75rem;color:var(--c3)">Goals (all scales)</div><div style="font-size:.75rem;font-family:monospace">TIME/active-goals.yaml</div>
        <div style="font-size:.75rem;color:var(--c3)">Strategy systems</div><div style="font-size:.75rem;font-family:monospace">TIME/strategy-systems.yaml</div>
        <div style="font-size:.75rem;color:var(--c3)">Wins log</div><div style="font-size:.75rem;font-family:monospace">MEMORY/wins.jsonl</div>
        <div style="font-size:.75rem;color:var(--c3)">Vision (HHGs, FPs, MTPs)</div><div style="font-size:.75rem;font-family:monospace">QUANTUM/vision/*.md</div>
        <div style="font-size:.75rem;color:var(--c3)">Personal context (9 files)</div><div style="font-size:.75rem;font-family:monospace">QUANTUM/personal-context/</div>
        <div style="font-size:.75rem;color:var(--c3)">Self-knowledge (birth data)</div><div style="font-size:.75rem;font-family:monospace">QUANTUM/self-knowledge/</div>
        <div style="font-size:.75rem;color:var(--c3)">Transit calendars</div><div style="font-size:.75rem;font-family:monospace">TIME/sign-calendar.yaml</div>
      </div>
      <div style="font-weight:700;margin:12px 0 6px;color:var(--c1)">Key Skills</div>
      <div style="display:grid;grid-template-columns:max-content 1fr;gap:4px 12px">
        <code style="font-size:.72rem">/morning</code><span style="font-size:.75rem;color:var(--c2)">Plan the day — review goals, set focus</span>
        <code style="font-size:.72rem">/win</code><span style="font-size:.75rem;color:var(--c2)">Log a win to MEMORY/wins.jsonl</span>
        <code style="font-size:.72rem">/weekly-review</code><span style="font-size:.75rem;color:var(--c2)">Full weekly review + planning cycle</span>
        <code style="font-size:.72rem">/strategist</code><span style="font-size:.75rem;color:var(--c2)">Define and update strategy systems</span>
        <code style="font-size:.72rem">/alignment</code><span style="font-size:.75rem;color:var(--c2)">Cross-dimension coherence check</span>
        <code style="font-size:.72rem">/cosmic-profile</code><span style="font-size:.75rem;color:var(--c2)">Update self-knowledge for Cosmic Blueprint</span>
      </div>
      <div style="font-weight:700;margin:12px 0 6px;color:var(--c1)">Dashboard Architecture</div>
      <p style="font-family:monospace;font-size:.7rem;background:var(--bg3);padding:8px;border-radius:6px;line-height:1.8">dashboard/server.js → /api/data<br>dashboard/lib/analytics.js → buildData()<br>dashboard/public/app.js → render views<br>PORT=3000 (default) | npm start</p>
    </div>`,
    RAW_ELEM_COLORS.ether, false);
  container.appendChild(sysGuide);
}

/* ---------- #learn/vper ---------- */
function renderLearnVper(container) {
  renderBackLink(container);
  const vper = DATA.vper || {};

  const wheelCard = document.createElement('div');
  wheelCard.className = 'edu-section';
  wheelCard.innerHTML = `<div class="edu-section-header">\u25BC VPER Cycle</div>
    <div class="edu-section-body">
      <p>Life is designed through four recurring phases, each connected to an element. The cycle repeats fractally across all time scales.</p>
      <div style="display:flex;justify-content:center;margin:16px 0">${svgVperWheel(vper.phase || 'execute')}</div>
      ${renderUserOverlay('Your Current Phase', `<strong style="color:${RAW_ELEM_COLORS[VPER_ELEMENT[(vper.phase||'execute').charAt(0).toUpperCase()+(vper.phase||'execute').slice(1)]] || 'var(--ether)'}">${(vper.phase||'execute').charAt(0).toUpperCase()+(vper.phase||'execute').slice(1)}</strong> since ${vper.phaseStarted || 'N/A'}`)}
    </div>`;
  container.appendChild(wheelCard);

  const phases = [
    { name: 'Vision',  element: 'fire',  desc: 'Clarify purpose, direction, what matters most. This is where alignment begins \u2014 in your WHY.' },
    { name: 'Plan',    element: 'air',   desc: 'Set clear goals across time horizons. Maximum 3 goals per period. Connect goals UP to vision and DOWN to actions.' },
    { name: 'Execute', element: 'earth', desc: 'Take aligned action. Ground your plans into reality. Focus on the ONE thing that matters most right now.' },
    { name: 'Review',  element: 'water', desc: 'Celebrate wins, extract insights, integrate learning. The Review Sequence: Celebrate, Recognize, Enhance, Reflect, Redirect, Energize.' }
  ];
  phases.forEach(p => {
    container.appendChild(renderEduSection(
      `${p.name} (${p.element.charAt(0).toUpperCase()+p.element.slice(1)})`,
      `<p>${p.desc}</p>`,
      RAW_ELEM_COLORS[p.element], false
    ));
  });

  container.appendChild(renderEduSection('Alignment (Ether)',
    '<p>The fifth element connecting all four into coherence. When Vision, Plan, Execute, and Review are in harmony, you experience alignment \u2014 today\'s actions serve tomorrow\'s vision.</p>',
    RAW_ELEM_COLORS.ether, false));

  container.appendChild(renderEduSection('Review Sequence',
    renderFlowDiagram(['Celebrate','Recognize','Enhance','Reflect','Redirect','Energize'],
      ['#2e7d32','#0097a7','#ef6c00','#1565c0','#9c27b0','#2e7d32']),
    RAW_ELEM_COLORS.water, true));

  container.appendChild(renderEduSection('Fractal Time Scales',
    `<p>The VPER cycle repeats at every time scale:</p>
    <table style="width:100%;font-size:.8rem;border-collapse:collapse">
      <tr style="border-bottom:2px solid var(--bg3)"><th style="text-align:left;padding:6px">Scale</th><th>Vision</th><th>Plan</th><th>Execute</th><th>Review</th></tr>
      <tr style="border-bottom:1px solid var(--bg3)"><td style="padding:6px;font-weight:600">Year</td><td style="text-align:center">Annual Vision</td><td style="text-align:center">Annual Goals</td><td style="text-align:center">Quarters</td><td style="text-align:center">Annual Review</td></tr>
      <tr style="border-bottom:1px solid var(--bg3)"><td style="padding:6px;font-weight:600">Quarter</td><td style="text-align:center">90-Day Vision</td><td style="text-align:center">Quarterly Goals</td><td style="text-align:center">Months</td><td style="text-align:center">Quarterly Review</td></tr>
      <tr style="border-bottom:1px solid var(--bg3)"><td style="padding:6px;font-weight:600">Month</td><td style="text-align:center">Monthly Focus</td><td style="text-align:center">Monthly Goals</td><td style="text-align:center">Weeks</td><td style="text-align:center">Monthly Review</td></tr>
      <tr style="border-bottom:1px solid var(--bg3)"><td style="padding:6px;font-weight:600">Week</td><td style="text-align:center">Weekly Intention</td><td style="text-align:center">Weekly Goals</td><td style="text-align:center">Days</td><td style="text-align:center">Weekly Review</td></tr>
      <tr><td style="padding:6px;font-weight:600">Day</td><td style="text-align:center">Morning Focus</td><td style="text-align:center">Daily Plan</td><td style="text-align:center">Actions</td><td style="text-align:center">Evening Reflection</td></tr>
    </table>`, RAW_ELEM_COLORS.ether, true));

  if (vper.elementalBalance) {
    const bal = vper.elementalBalance;
    let balHTML = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;text-align:center">';
    ['fire','air','earth','water'].forEach(e => {
      const s = bal[e] ? bal[e].score : 0;
      balHTML += `<div style="padding:10px;border-radius:8px;background:${RAW_ELEM_COLORS[e]}22;border:1px solid ${RAW_ELEM_COLORS[e]}44">
        <div style="font-size:1.2rem;font-weight:700;color:${RAW_ELEM_COLORS[e]}">${s}</div>
        <div style="font-size:.7rem;color:var(--c2)">${e.charAt(0).toUpperCase()+e.slice(1)}</div>
      </div>`;
    });
    balHTML += '</div>';
    const overlay = document.createElement('div');
    overlay.innerHTML = renderUserOverlay('Your Elemental Balance', balHTML);
    container.appendChild(overlay);
  }
}

/* ---------- #learn/elements ---------- */
function renderLearnElements(container) {
  renderBackLink(container);
  const vper = DATA.vper || {};

  const elements = [
    { name: 'Fire',  key: 'fire',  principle: 'Transformation & Creation',  psychology: 'Passion, initiative, courage, vision',          vperMapping: 'Vision',  whenWeak: 'Lack of motivation, unclear direction, procrastination', whenUncontrolled: 'Burnout, impulsiveness, aggression, over-commitment', nature: 'Sun, volcanoes, lightning', body: 'Heart, metabolism',      geometry: 'Tetrahedron' },
    { name: 'Air',   key: 'air',   principle: 'Communication & Intellect',   psychology: 'Thinking, analysis, social connection, ideas',   vperMapping: 'Plan',    whenWeak: 'Scattered thinking, indecision, isolation',              whenUncontrolled: 'Over-analysis, detachment, anxiety, restlessness',   nature: 'Wind, breath, sky',        body: 'Lungs, nervous system',  geometry: 'Octahedron'  },
    { name: 'Earth', key: 'earth', principle: 'Stability & Manifestation',   psychology: 'Discipline, patience, persistence, structure',   vperMapping: 'Execute', whenWeak: 'Inconsistency, lack of follow-through, ungrounded',      whenUncontrolled: 'Rigidity, stubbornness, materialism, workaholism',  nature: 'Mountains, soil, crystals',body: 'Bones, muscles',         geometry: 'Hexahedron'  },
    { name: 'Water', key: 'water', principle: 'Emotion & Reflection',        psychology: 'Empathy, intuition, emotional depth, healing',   vperMapping: 'Review',  whenWeak: 'Emotional numbness, inability to reflect, stagnation',   whenUncontrolled: 'Overwhelm, moodiness, attachment, excessive rumination', nature: 'Oceans, rivers, rain', body: 'Blood, lymph',           geometry: 'Icosahedron' }
  ];

  const grid = document.createElement('div');
  grid.className = 'grid-2';
  grid.style.marginBottom = '16px';
  elements.forEach(el => {
    const card = document.createElement('div');
    card.className = 'element-card';
    card.style.borderLeftColor = RAW_ELEM_COLORS[el.key];
    card.innerHTML = `
      <div class="element-title" onclick="this.nextElementSibling.classList.toggle('hidden');this.parentElement.classList.toggle('expanded')">
        <span style="color:${RAW_ELEM_COLORS[el.key]}">${el.name}</span>
        <span style="font-size:.7rem;color:var(--c3)">${el.principle}</span>
      </div>
      <div class="element-body hidden">
        <p><strong>Psychology:</strong> ${el.psychology}</p>
        <p><strong>VPER Phase:</strong> ${el.vperMapping}</p>
        <p><strong>When Weak:</strong> ${el.whenWeak}</p>
        <p><strong>When Uncontrolled:</strong> ${el.whenUncontrolled}</p>
        <p><strong>In Nature:</strong> ${el.nature} | <strong>In Body:</strong> ${el.body}</p>
        <p><strong>Sacred Geometry:</strong> ${el.geometry}</p>
      </div>`;
    grid.appendChild(card);
  });
  container.appendChild(grid);

  container.appendChild(renderEduSection('Ether (Alignment)',
    '<p><strong>Principle:</strong> Integration & Coherence</p><p>Ether is the fifth element \u2014 the space in which all others exist. It represents alignment itself: the coherent field that connects Vision, Plan, Execute, and Review into a unified cycle.</p>',
    RAW_ELEM_COLORS.ether, true));

  container.appendChild(renderEduSection('Opposite Pole Principle',
    `<p>Each element pair holds complementary wisdom. When one is weak, look to its opposite for medicine:</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0">
      <div style="padding:12px;border-radius:8px;background:${RAW_ELEM_COLORS.fire}11;border:1px solid ${RAW_ELEM_COLORS.fire}44;text-align:center">
        <strong style="color:${RAW_ELEM_COLORS.fire}">Fire</strong> <span style="color:var(--c3)">\u2194</span> <strong style="color:${RAW_ELEM_COLORS.water}">Water</strong>
        <div style="font-size:.75rem;color:var(--c2);margin-top:4px">Action \u2194 Reflection</div>
      </div>
      <div style="padding:12px;border-radius:8px;background:${RAW_ELEM_COLORS.air}11;border:1px solid ${RAW_ELEM_COLORS.air}44;text-align:center">
        <strong style="color:${RAW_ELEM_COLORS.air}">Air</strong> <span style="color:var(--c3)">\u2194</span> <strong style="color:${RAW_ELEM_COLORS.earth}">Earth</strong>
        <div style="font-size:.75rem;color:var(--c2);margin-top:4px">Thinking \u2194 Doing</div>
      </div>
    </div>`, RAW_ELEM_COLORS.ether, true));

  const bal = vper.elementalBalance || {};
  let assessHTML = '<p>Rate your current elemental balance (1 = weak, 10 = strong):</p>';
  ['fire','air','earth','water'].forEach(e => {
    const val = bal[e] ? bal[e].score : 5;
    assessHTML += `<div class="slider-group">
      <label><span style="color:${RAW_ELEM_COLORS[e]}">${e.charAt(0).toUpperCase()+e.slice(1)}</span><span id="slider_${e}_val">${val}</span></label>
      <input type="range" min="1" max="10" value="${val}" oninput="document.getElementById('slider_${e}_val').textContent=this.value">
    </div>`;
  });
  if (vper.elementFocus) {
    assessHTML += renderUserOverlay('Element Needing Attention', `<strong style="color:${RAW_ELEM_COLORS[vper.elementFocus]}">${vper.elementFocus.charAt(0).toUpperCase()+vper.elementFocus.slice(1)}</strong> \u2014 this element currently needs more focus.`);
  }
  container.appendChild(renderEduSection('Elemental Self-Assessment', assessHTML, RAW_ELEM_COLORS.ether, true));
}

/* ---------- #learn/gap-to-gain ---------- */
function renderLearnGapToGain(container) {
  renderBackLink(container);
  const wa   = DATA.winAnalytics || {};
  const wins = DATA.wins || [];

  container.appendChild(renderEduSection('The Gap vs The Gain',
    renderTabGroup([
      { label: 'The Gap', content: `<div style="padding:12px;background:#c1554d11;border-left:4px solid #c1554d;border-radius:0 8px 8px 0;margin:8px 0">
        <p><strong style="color:#c1554d">The Gap</strong> is every time you compare yourself to an ideal.</p>
        <p>It breeds dissatisfaction, anxiety, and the feeling that you're never enough. The ideal keeps moving, so you never arrive.</p>
        <p>Hedonic adaptation means you constantly seek a new and better scenario. The Gap is an attempt to reach an ever-moving target.</p>
      </div>` },
      { label: 'The Gain', content: `<div style="padding:12px;background:#2e7d3211;border-left:4px solid #2e7d32;border-radius:0 8px 8px 0;margin:8px 0">
        <p><strong style="color:#2e7d32">The Gain</strong> is every time you compare yourself to your previous self.</p>
        <p>It builds confidence, gratitude, and momentum. Your reference point is always your past \u2014 a fixed, measurable target.</p>
        <p>Simple and powerful: acknowledge all the progress you've already made.</p>
      </div>` }
    ]), RAW_ELEM_COLORS.water, true));

  const concepts = [
    { title: 'Always Start with Wins',  desc: 'Every review, every planning session, every conversation begins by celebrating what went well. Wins are evidence of capability.' },
    { title: 'No Failure, Only Data',   desc: 'Reframe every setback as information. What did it teach you? What will you do differently? There is no failure \u2014 only experiments that produced data.' },
    { title: 'Healthy Detachment',      desc: "Be heavily committed to your goals but emotionally detached from the outcome. If it happens, GREAT! If it doesn't, OK! You don't need it to be happy." }
  ];
  let conceptsHTML = '';
  concepts.forEach(c => {
    conceptsHTML += `<div style="padding:12px;margin-bottom:8px;background:var(--bg3);border-radius:8px">
      <div style="font-weight:700;font-size:.85rem;margin-bottom:4px">${c.title}</div>
      <div style="font-size:.8rem;color:var(--c2)">${c.desc}</div>
    </div>`;
  });
  container.appendChild(renderEduSection('Why This Matters', conceptsHTML, RAW_ELEM_COLORS.water, true));

  const scales = ['Daily: End each day by listing 3 wins.','Weekly: Start weekly reviews with all wins from the week.','Monthly: Count total wins, compare to last month.','Quarterly: Review 90-day trajectory. How far have you come?','Annual: Full year Gain measurement. Who were you 12 months ago?'];
  let scaleHTML = '<ol style="padding-left:20px">';
  scales.forEach(s => { scaleHTML += `<li style="margin-bottom:8px;font-size:.82rem">${s}</li>`; });
  scaleHTML += '</ol>';
  container.appendChild(renderEduSection('Applying the Gain at Every Scale', scaleHTML, RAW_ELEM_COLORS.water, false));

  container.appendChild(renderEduSection('Connection to Water Element',
    `<p>In Portuguese, "m\u00E1goa" (resentment/grief) literally translates to "bad water." The Gap produces m\u00E1goa \u2014 stagnant, toxic emotional residue from constantly falling short of ideals.</p>
    <p>The Gain is clean, flowing water \u2014 acknowledging progress, releasing attachment, moving forward with clarity.</p>
    <p>The Review phase (Water) in the VPER cycle is where the Gain lives. Every review starts with celebration.</p>`,
    RAW_ELEM_COLORS.water, false));

  let quotesHTML = '';
  quotesHTML += renderQuoteCard('Those who have a "why" to live, can bear with almost any "how".', 'Viktor Frankl quoting Friedrich Nietzsche');
  quotesHTML += renderQuoteCard('You actively choose how to measure your progress. In The Gap you compare to an ideal. In The Gain you compare to your previous self.', 'Dan Sullivan');
  quotesHTML += renderQuoteCard('Goals are not a fixed destination you arrive at. Rather, a goal represents the direction you want to go.', 'Fis Fraga');
  container.appendChild(renderEduSection('Key Quotes', quotesHTML, RAW_ELEM_COLORS.ether, false));

  const total  = wa.total90d || wins.length || 0;
  const streak = wa.currentStreak || 0;
  const avg    = wa.weeklyAvg != null ? wa.weeklyAvg : (wins.length / 13).toFixed(1);
  const overlay = document.createElement('div');
  overlay.innerHTML = renderUserOverlay('Your Gain \u2014 Evidence of Progress',
    `<div style="display:flex;gap:20px;flex-wrap:wrap">
      <div><span style="font-size:1.4rem;font-weight:800;color:var(--earth)">${total}</span><div style="font-size:.65rem;color:var(--c3)">WINS (90 DAYS)</div></div>
      <div><span style="font-size:1.4rem;font-weight:800;color:var(--earth)">${avg}</span><div style="font-size:.65rem;color:var(--c3)">WEEKLY AVG</div></div>
      <div><span style="font-size:1.4rem;font-weight:800;color:var(--earth)">${streak}</span><div style="font-size:.65rem;color:var(--c3)">CURRENT STREAK</div></div>
    </div>
    <p style="margin-top:10px;font-size:.82rem;color:var(--c2)">You've logged <strong>${total}</strong> wins in the last 90 days. That's the Gain.</p>`);
  container.appendChild(overlay);
}

/* ---------- #learn/areas ---------- */
function renderLearnAreas(container) {
  renderBackLink(container);
  const areas = DATA.areas || [];

  container.appendChild(renderEduSection('The 12 Key Areas Framework',
    '<p>ILOS organizes life into 12 Key Areas, mapped to the 12 zodiac houses. Each area belongs to one of four elements, creating a balanced system that covers every dimension of human experience.</p>' +
    renderCycleDiagram(
      ['Fire: Identity & Expression','Earth: Resources & Structure','Air: Mind & Relationships','Water: Inner World & Spirit'],
      [RAW_ELEM_COLORS.fire, RAW_ELEM_COLORS.earth, RAW_ELEM_COLORS.air, RAW_ELEM_COLORS.water]
    ), RAW_ELEM_COLORS.earth, true));

  const areaMap = [
    { id:'health',      name:'Health & Vitality',               house:1,  elem:'fire',  desc:'Physical body, energy, self-image. How you show up in the world.'     },
    { id:'finances',    name:'Finances & Resources',            house:2,  elem:'earth', desc:'Money, assets, material security. What you value and build.'           },
    { id:'intellectual',name:'Intellectual & Communication',    house:3,  elem:'air',   desc:'Learning, communication, ideas. How you think and share.'              },
    { id:'home',        name:'Home & Foundation',               house:4,  elem:'water', desc:'Family, roots, emotional base. Where you feel safe.'                   },
    { id:'creative',    name:'Creative Expression',             house:5,  elem:'fire',  desc:'Creativity, joy, children, romance. What brings you alive.'            },
    { id:'routines',    name:'Routines & Service',              house:6,  elem:'earth', desc:'Daily habits, health routines, service. How you maintain yourself.'    },
    { id:'love',        name:'Love & Partnership',              house:7,  elem:'air',   desc:'Intimate relationships, partnerships, collaboration.'                   },
    { id:'emotional',   name:'Emotional Depth',                 house:8,  elem:'water', desc:'Transformation, shared resources, deep emotional processes.'            },
    { id:'vision',      name:'Vision & Expansion',              house:9,  elem:'fire',  desc:'Philosophy, travel, higher learning. Your big-picture worldview.'      },
    { id:'career',      name:'Career & Legacy',                 house:10, elem:'earth', desc:'Career, public reputation, legacy. Your contribution to the world.'    },
    { id:'social',      name:'Social & Community',              house:11, elem:'air',   desc:'Friends, networks, collective purpose. Your tribe and causes.'          },
    { id:'spiritual',   name:'Spiritual & Transcendence',       house:12, elem:'water', desc:'Spirituality, solitude, the unconscious. Inner wisdom.'               }
  ];

  ['fire','earth','air','water'].forEach(elem => {
    const elemAreas = areaMap.filter(a => a.elem === elem);
    const label     = document.createElement('div');
    label.style.cssText = `font-size:.75rem;font-weight:700;text-transform:uppercase;color:${RAW_ELEM_COLORS[elem]};margin:16px 0 8px;letter-spacing:.04em`;
    label.textContent   = elem.charAt(0).toUpperCase() + elem.slice(1);
    container.appendChild(label);

    const row = document.createElement('div');
    row.className = 'grid-4x3';
    elemAreas.forEach(a => {
      const userData = areas.find(ua => ua.id === a.id);
      const health   = userData ? userData.healthScore || 0 : 0;
      const winCount = userData ? userData.winCount90d || 0 : 0;
      const card     = document.createElement('div');
      card.className = 'area-card';
      card.style.borderLeftColor = RAW_ELEM_COLORS[a.elem];
      card.innerHTML = `
        <div class="area-header">
          <div>
            <div class="area-name">${a.name}</div>
            <div style="font-size:.65rem;color:var(--c3)">House ${a.house}</div>
          </div>
          ${svgHealthDonut(health, a.elem)}
        </div>
        <div style="font-size:.78rem;color:var(--c2);margin-top:4px">${a.desc}</div>
        <div class="area-meta"><span class="win-badge">${winCount} wins</span></div>`;
      row.appendChild(card);
    });
    container.appendChild(row);
  });
}

/* ---------- #learn/goals ---------- */
function renderLearnGoals(container) {
  renderBackLink(container);
  const goals  = DATA.goals  || {};
  const vision = DATA.vision || {};

  container.appendChild(renderEduSection('The Alignment Chain',
    '<p>Alignment starts at your highest vision and flows down to daily actions. Each level feeds from the one above and supports the one below.</p>' +
    renderFlowDiagram(
      ['Purpose','Vision','Goals','Projects','Systems','Daily Actions'],
      [RAW_ELEM_COLORS.ether, RAW_ELEM_COLORS.fire, RAW_ELEM_COLORS.air, RAW_ELEM_COLORS.earth, RAW_ELEM_COLORS.earth, RAW_ELEM_COLORS.earth]
    ) +
    '<p style="margin-top:12px;font-size:.82rem;color:var(--c2)">You are fueled by your purpose to face the challenges of each day. <strong>Get insanely clear on WHAT you want and WHY you want it.</strong></p>',
    RAW_ELEM_COLORS.ether, true));

  if (vision.hhgs && vision.hhgs.length) {
    let chainHTML = '<div style="font-size:.82rem">';
    chainHTML += '<div style="font-weight:700;margin-bottom:6px;color:var(--ether)">Your High Hard Goals:</div>';
    vision.hhgs.forEach(h => {
      chainHTML += `<div style="padding:4px 8px;margin-bottom:4px;background:var(--ether-soft);border-radius:4px">\u25C8 ${h.title}${h.timeframe ? ` <span style="color:var(--c3);font-size:.7rem">(${h.timeframe})</span>` : ''}</div>`;
    });
    const annualActive = (goals.annual || []).filter(g => g.status === 'active');
    if (annualActive.length) {
      chainHTML += '<div style="font-weight:700;margin:10px 0 6px;color:var(--fire)">Your Annual Goals:</div>';
      annualActive.forEach(g => {
        chainHTML += `<div style="padding:4px 8px;margin-bottom:4px;background:var(--fire-soft);border-radius:4px">${g.description}</div>`;
      });
    }
    chainHTML += '</div>';
    const overlay = document.createElement('div');
    overlay.innerHTML = renderUserOverlay('Your Alignment Chain', chainHTML);
    container.appendChild(overlay);
  }

  container.appendChild(renderEduSection('The Three Parts of Reviewing',
    renderTabGroup([
      { label: 'Celebrating', content: '<p style="padding:8px;font-size:.82rem">Celebrate the positive aspects of the cycle. Wins, progress, breakthroughs, lessons. Start EVERY review here \u2014 this is non-negotiable in ILOS.</p>' },
      { label: 'Redirecting', content: '<p style="padding:8px;font-size:.82rem">Redirect your goals, projects, and tasks for the next cycle. Adjust direction based on what you learned. Flexibility is strength.</p>' },
      { label: 'Improving',   content: '<p style="padding:8px;font-size:.82rem">Improve the negative aspects of the cycle. What systems broke down? What habits slipped? How can you do better next time?</p>' }
    ]), RAW_ELEM_COLORS.water, true));

  container.appendChild(renderEduSection('Dragon Dreaming',
    '<p>A project management philosophy based on collective intelligence and balance:</p>' +
    renderCycleDiagram(
      ['Dreaming','Planning','Doing','Celebrating'],
      [RAW_ELEM_COLORS.fire, RAW_ELEM_COLORS.air, RAW_ELEM_COLORS.earth, RAW_ELEM_COLORS.water]
    ) +
    '<p style="margin-top:12px;font-size:.82rem;color:var(--c2)">Modern society has lost touch with <strong>Dreaming</strong> and <strong>Celebrating</strong>. These are the most important stages for alignment.</p>',
    RAW_ELEM_COLORS.ether, false));

  let quotesHTML = '';
  quotesHTML += renderQuoteCard('Those who have a "why" to live, can bear with almost any "how".', 'Viktor Frankl');
  quotesHTML += renderQuoteCard("When goals are clear, the mind doesn't have to wonder about what to do next.", 'Steven Kotler');
  quotesHTML += renderQuoteCard('Goals without Projects are Dreams.', 'Tiago Forte');
  quotesHTML += renderQuoteCard("You can't connect the dots looking forward; you can only connect them looking backwards.", 'Steve Jobs');
  container.appendChild(renderEduSection('Key Quotes', quotesHTML, RAW_ELEM_COLORS.ether, false));
}

/* ---------- #learn/planning ---------- */
function renderLearnPlanning(container) {
  renderBackLink(container);

  container.appendChild(renderEduSection('The Power of Intentional Planning',
    '<p><strong>Intentional planning is life changing. Period.</strong></p><p>When you take time to plan, you have a shot at greatness. The secret: swap the perfect plan for intentional cycles.</p>',
    RAW_ELEM_COLORS.ether, true));

  container.appendChild(renderEduSection('The Four Stages',
    renderCycleDiagram(
      ['1. Vision','2. Plan','3. Execute','4. Review'],
      [RAW_ELEM_COLORS.fire, RAW_ELEM_COLORS.air, RAW_ELEM_COLORS.earth, RAW_ELEM_COLORS.water]
    ) +
    '<p style="margin-top:12px;font-size:.82rem;color:var(--c2)">Every Year, Quarter, Month and Week, go through this cycle. Things get interesting when you <strong>connect everything</strong> across scales.</p>',
    RAW_ELEM_COLORS.ether, true));

  const steps = [
    { title: 'Step 1: Measure the Gain',         desc: 'List all your wins for the past year. This puts you into a state of confidence, motivation, and courage.',                                    element: 'water' },
    { title: 'Step 2: Visualize Your Future Self',desc: 'How can you 10X your life in the next 3 years? Write out exactly how your Future Self is 10X better than you today.',                       element: 'fire'  },
    { title: 'Step 3: Reflect on Priorities',     desc: 'Given your Future Self, what are your priorities NOW? Pick the top 3 \u2014 if you have more than 3 priorities, you have none.',           element: 'air'   },
    { title: 'Step 4: Set Big Goals',             desc: 'From your top 3 priorities, set goals for the year. Goals give direction. Go Big. What matters is progress.',                               element: 'earth' }
  ];
  let stepsHTML = '';
  steps.forEach(s => {
    stepsHTML += `<div style="padding:12px;margin-bottom:8px;border-radius:8px;background:${RAW_ELEM_COLORS[s.element]}11;border-left:3px solid ${RAW_ELEM_COLORS[s.element]}">
      <div style="font-weight:700;font-size:.85rem;color:${RAW_ELEM_COLORS[s.element]}">${s.title}</div>
      <div style="font-size:.8rem;color:var(--c2);margin-top:4px">${s.desc}</div>
    </div>`;
  });
  container.appendChild(renderEduSection('How to Plan Your Year', stepsHTML, RAW_ELEM_COLORS.ether, true));

  container.appendChild(renderEduSection('Cycles of Time',
    `<p>Life happens in Cycles of Time, from Year down to Day:</p>
    ${renderFlowDiagram(['Year','Quarter','Month','Week','Day'], [RAW_ELEM_COLORS.fire, RAW_ELEM_COLORS.air, RAW_ELEM_COLORS.earth, RAW_ELEM_COLORS.water, RAW_ELEM_COLORS.ether])}
    <p style="margin-top:12px;font-size:.82rem;color:var(--c2)">Planning your year is a <strong>continuous process</strong>. You only have 2 tasks per cycle: <strong>Set 3 Big Goals</strong> and <strong>List All Your Wins</strong>.</p>`,
    RAW_ELEM_COLORS.ether, true));

  const principles = [
    { title: 'Planning is a Process',         desc: 'Not a one-time event. Continuous reflection across multiple time cycles.'                    },
    { title: 'Progress Over Perfection',       desc: "Focus on how much you've gained, not how much is left."                                      },
    { title: 'Big Goals + Healthy Detachment', desc: 'Set audacious goals for direction. Stay flexible and adaptable.'                             },
    { title: 'Cycles Connect Everything',      desc: 'Year \u2192 Quarter \u2192 Month \u2192 Week \u2192 Day. Each cycle informs the next.'       },
    { title: 'Integration with Your Life OS',  desc: 'Planning connects to Projects, Areas, Goals. Creates a holistic system.'                     },
    { title: 'Simplicity at the Core',         desc: 'Just 2 tasks per cycle: Set Goals + List Wins. The 80/20 of effectiveness.'                  }
  ];
  let princHTML = '';
  principles.forEach((p, i) => {
    princHTML += `<div style="padding:10px 12px;margin-bottom:6px;background:var(--bg3);border-radius:8px;display:flex;gap:10px;align-items:flex-start">
      <span style="font-weight:800;color:var(--ether);font-size:.9rem;flex-shrink:0">${i+1}</span>
      <div><div style="font-weight:700;font-size:.82rem">${p.title}</div><div style="font-size:.78rem;color:var(--c2)">${p.desc}</div></div>
    </div>`;
  });
  container.appendChild(renderEduSection('6 Key Principles', princHTML, RAW_ELEM_COLORS.ether, true));

  let quotesHTML = '';
  quotesHTML += renderQuoteCard("If you don't design your own life plan, chances are you'll fall into someone else's plan.", 'Jim Rohn');
  quotesHTML += renderQuoteCard('Do not go where the path may lead, go instead where there is no path and leave a trail.', 'Ralph Waldo Emerson');
  quotesHTML += renderQuoteCard('Plans are nothing; planning is everything.', 'Dwight D. Eisenhower');
  quotesHTML += renderQuoteCard('99% of people aim for "realistic" goals, paradoxically making them the most competitive.', 'Tim Ferriss');
  container.appendChild(renderEduSection('Key Quotes', quotesHTML, RAW_ELEM_COLORS.ether, false));
}

/* ---------- #transits (combined with cosmic teaser) ---------- */
function renderTransitsAndCosmic(container) {
  renderTransits(container);
  /* Divider */
  const div = document.createElement('div');
  div.style.cssText = 'border-top:2px solid var(--bg3);margin:20px 0 16px;position:relative;text-align:center';
  div.innerHTML = '<span style="position:relative;background:var(--bg1);padding:0 10px;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--ether)">\u2727 Cosmic Blueprint</span>';
  container.appendChild(div);
  renderCosmicTeaser(container);
}

function renderTransits(container) {
  const t    = DATA.transits || {};
  const vper = DATA.vper     || {};

  if (!t.sunSign && !t.slowPlanets) {
    container.innerHTML = '<div class="card"><div class="card-title">Transits</div><p style="color:var(--c3);font-size:.85rem">Transit data not configured. Add <code>TIME/sign-calendar.yaml</code> to enable.</p></div>';
    return;
  }

  /* Cosmic VPER Summary */
  const cosmicVper    = t.cosmicVper || {};
  const dominantPhase = cosmicVper.dominantPhase || 'execute';
  const phaseCap      = dominantPhase.charAt(0).toUpperCase() + dominantPhase.slice(1);
  const phaseElem     = VPER_ELEMENT[phaseCap] || 'earth';

  const vperCard = document.createElement('div');
  vperCard.className = 'transit-card';
  vperCard.innerHTML = `<div class="transit-card-title">Cosmic VPER Phase</div>
    <div style="display:flex;justify-content:center;margin-bottom:16px">${svgVperWheel(dominantPhase)}</div>
    <p style="text-align:center;font-size:.9rem">The cosmos is currently in <strong style="color:${RAW_ELEM_COLORS[phaseElem]}">${phaseCap}</strong> mode</p>`;
  container.appendChild(vperCard);

  /* Elemental Weather */
  const ew = t.elementalWeather || {};
  const ewCard = document.createElement('div');
  ewCard.className = 'transit-card';
  let ewHTML = '<div class="transit-card-title">Elemental Weather</div><div class="elemental-weather-summary">';
  ['fire','air','earth','water'].forEach(e => {
    const count      = ew[e] || 0;
    const isDominant = e === ew.dominant;
    const isWeakest  = e === ew.weakest;
    ewHTML += `<div class="ew-item" style="background:${RAW_ELEM_COLORS[e]}${isDominant ? '33' : '15'};${isWeakest ? 'border:1px dashed '+RAW_ELEM_COLORS[e] : ''}">
      <div class="ew-count" style="color:${RAW_ELEM_COLORS[e]}">${count}</div>
      <div class="ew-label" style="color:${RAW_ELEM_COLORS[e]}">${e}</div>
      ${isDominant ? '<div style="font-size:.6rem;color:var(--c2)">DOMINANT</div>' : ''}
      ${isWeakest  ? '<div style="font-size:.6rem;color:var(--c3)">WEAKEST</div>'  : ''}
    </div>`;
  });
  ewHTML += '</div>';
  if (ew.summary) ewHTML += `<p style="text-align:center;font-size:.82rem;color:var(--c2);margin-top:8px;font-style:italic">${ew.summary}</p>`;
  ewCard.innerHTML = ewHTML;
  container.appendChild(ewCard);

  /* Active Areas */
  const activeAreas = (cosmicVper.activeAreas || []).slice(0, 6);
  if (activeAreas.length) {
    const aaCard = document.createElement('div');
    aaCard.className = 'transit-card';
    let aaHTML = '<div class="transit-card-title">Active Life Areas</div>';
    activeAreas.forEach(a => {
      const elem = a.element || 'earth';
      aaHTML += `<div class="active-area-card" style="border-left-color:${RAW_ELEM_COLORS[elem]}">
        <div class="area-info">
          <div class="name">${a.areaName || 'Area ' + a.houseNum}</div>
          <div class="planet">Activated by ${a.planet}</div>
        </div>
        <span class="sign-badge" style="background:${RAW_ELEM_COLORS[elem]}22;color:${RAW_ELEM_COLORS[elem]}">${elem}</span>
      </div>`;
    });
    aaCard.innerHTML = aaHTML;
    container.appendChild(aaCard);
  }

  /* Moon Phase */
  const moon = t.moonPhase || {};
  if (moon.name) {
    const moonCard = document.createElement('div');
    moonCard.className = 'moon-widget';
    moonCard.innerHTML = `
      <div class="moon-emoji">${moon.emoji || '\uD83C\uDF15'}</div>
      <div class="moon-name">${moon.name}</div>
      <div class="moon-illumination">${moon.illumination != null ? moon.illumination + '% illumination' : ''}</div>
      <div class="moon-guidance">${moon.guidance || ''}</div>`;
    container.appendChild(moonCard);
  }

  /* Slow Planet Table */
  const planets = t.slowPlanets || [];
  if (planets.length) {
    const ptCard = document.createElement('div');
    ptCard.className = 'transit-card';
    let ptHTML = '<div class="transit-card-title">Slow Planet Positions</div>';
    planets.forEach(p => {
      const elem  = p.element || SIGN_ELEMENT[p.sign] || 'earth';
      const phase = p.vperPhase || SIGN_VPER[p.sign] || 'execute';
      const pCap  = phase.charAt(0).toUpperCase() + phase.slice(1);
      ptHTML += `<div class="planet-row">
        <span class="planet-name">${p.name}</span>
        <span class="sign-badge" style="background:${RAW_ELEM_COLORS[elem]}22;color:${RAW_ELEM_COLORS[elem]}">${(p.sign||'').charAt(0).toUpperCase()+(p.sign||'').slice(1)}</span>
        <span class="phase-badge" style="background:${RAW_ELEM_COLORS[VPER_ELEMENT[pCap]||'earth']}22;color:${RAW_ELEM_COLORS[VPER_ELEMENT[pCap]||'earth']}">${pCap}</span>
        <span style="flex:1"></span>
        <span style="font-size:.72rem;color:var(--c3)">${elem}</span>
      </div>`;
    });
    ptCard.innerHTML = ptHTML;
    container.appendChild(ptCard);
  }

  /* Cosmic vs Personal */
  const userPhase    = vper.phase || 'execute';
  const userPhaseCap = userPhase.charAt(0).toUpperCase() + userPhase.slice(1);
  const cosmicElem   = VPER_ELEMENT[phaseCap]     || 'earth';
  const userElem     = VPER_ELEMENT[userPhaseCap] || 'earth';
  const aligned      = dominantPhase === userPhase;

  const vsCard = document.createElement('div');
  vsCard.className = 'cosmic-vs-personal';
  vsCard.innerHTML = `
    <div class="vs-side">
      <div style="font-size:.65rem;text-transform:uppercase;color:var(--c3);margin-bottom:4px">Cosmic Phase</div>
      <div class="vs-phase" style="color:${RAW_ELEM_COLORS[cosmicElem]}">${phaseCap}</div>
      <div class="vs-element">${cosmicElem}</div>
    </div>
    <div class="vs-label">${aligned ? '\u2713 Aligned' : '\u26A1 Tension'}</div>
    <div class="vs-side">
      <div style="font-size:.65rem;text-transform:uppercase;color:var(--c3);margin-bottom:4px">Your Phase</div>
      <div class="vs-phase" style="color:${RAW_ELEM_COLORS[userElem]}">${userPhaseCap}</div>
      <div class="vs-element">${userElem}</div>
    </div>`;
  container.appendChild(vsCard);

  if (!aligned) {
    const hint = document.createElement('div');
    hint.style.cssText = 'text-align:center;font-size:.78rem;color:var(--c2);margin-top:-8px;margin-bottom:16px';
    hint.textContent = `The cosmos favors ${phaseCap} energy while you're in ${userPhaseCap}. Consider how to bridge these energies.`;
    container.appendChild(hint);
  }
}

/* ---------- #cosmic-teaser ---------- */
function renderCosmicTeaser(container) {
  const ct = DATA.cosmicTeaser || {};

  const header = document.createElement('div');
  header.className = 'transit-card';
  header.style.textAlign    = 'center';
  header.style.borderBottom = '3px solid var(--ether)';
  header.innerHTML = `
    <div style="font-size:2rem;margin-bottom:8px">\u2727</div>
    <div style="font-size:1.2rem;font-weight:800;margin-bottom:4px">Cosmic Blueprint</div>
    <div style="font-size:.85rem;color:var(--c2)">Your celestial DNA decoded through Astrology, Human Design, and Gene Keys</div>`;
  container.appendChild(header);

  if (ct.hasBirthData && ct.sunSign) {
    const elem = SIGN_ELEMENT[ct.sunSign] || (ct.dominantElement || 'fire');
    const profileCard = document.createElement('div');
    profileCard.className = 'transit-card';
    profileCard.style.borderLeft = `4px solid ${RAW_ELEM_COLORS[elem]}`;
    const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
    const stat = (label, val, color) => val
      ? `<div><div style="font-size:.7rem;color:var(--c3);text-transform:uppercase">${label}</div><div style="font-size:1.05rem;font-weight:700${color ? ';color:'+color : ''}">${val}</div></div>`
      : '';
    profileCard.innerHTML = `
      <div class="transit-card-title">Your Cosmic Profile</div>
      <div style="display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap;margin-bottom:${(ct.hdType || ct.gkLifesWork) ? '14px' : '0'}">
        ${stat('Sun Sign', ct.sunSign ? cap(ct.sunSign) : null, RAW_ELEM_COLORS[elem])}
        ${stat('Dominant Element', ct.dominantElement ? cap(ct.dominantElement) : null, RAW_ELEM_COLORS[ct.dominantElement])}
        ${stat('Ascendant', ct.ascendant ? cap(ct.ascendant) : null)}
      </div>
      ${ct.hdType ? `<div style="display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap;padding-top:10px;border-top:1px solid var(--bg3)">
        ${stat('HD Type', ct.hdType)}
        ${stat('Authority', ct.hdAuthority)}
        ${stat('Profile', ct.hdProfile)}
        ${stat('Definition', ct.hdDefinition)}
      </div>` : ''}
      ${ct.gkLifesWork ? `<div style="padding-top:10px;border-top:1px solid var(--bg3)">
        ${stat("Life's Work", 'GK ' + ct.gkLifesWork)}
      </div>` : ''}`;
    container.appendChild(profileCard);
  } else {
    const noData = document.createElement('div');
    noData.className = 'transit-card';
    noData.style.textAlign = 'center';
    noData.innerHTML = `
      <div style="font-size:1.5rem;margin-bottom:8px">\uD83D\uDD12</div>
      <p style="color:var(--c2);font-size:.85rem">Run <code>/cosmic-profile</code> to add your Astrology, Human Design &amp; Gene Keys data</p>
      <p style="color:var(--c3);font-size:.78rem;margin-top:4px">Saved to <code>QUANTUM/self-knowledge/cosmic-profile.yaml</code> — dashboard refreshes automatically</p>`;
    container.appendChild(noData);
  }

  const teasers = [
    { title: 'Your Life Purpose Path',    desc: 'Discover the Incarnation Cross and Gene Key sequences that reveal your unique purpose and evolutionary journey.' },
    { title: 'Your Energy Type',          desc: 'Understand your Human Design Type, Strategy, and Authority \u2014 the blueprint for making correct decisions.'     },
    { title: 'Your Transformation Keys',  desc: 'Explore the Gene Keys in your profile \u2014 Shadow frequencies to transmute and Gift frequencies to embody.'      }
  ];

  const teaserGrid = document.createElement('div');
  teaserGrid.className = 'grid-3';
  teaserGrid.style.marginBottom = '20px';
  teasers.forEach(t => {
    const card = document.createElement('div');
    card.className = 'teaser-card';
    card.innerHTML = `
      <div class="lock-icon">\uD83D\uDD12</div>
      <div class="teaser-title">${t.title}</div>
      <div class="teaser-desc">${t.desc}</div>`;
    teaserGrid.appendChild(card);
  });
  container.appendChild(teaserGrid);

  const connCard = document.createElement('div');
  connCard.className = 'transit-card';
  connCard.innerHTML = `
    <div class="transit-card-title">ILOS Connection</div>
    <p style="font-size:.85rem;color:var(--c2);line-height:1.6">Your cosmic profile connects directly to your 12 Key Areas. Each planet in your birth chart activates a specific life domain through the zodiac houses. Current transits show which areas are being energized RIGHT NOW \u2014 creating a bridge between celestial patterns and practical life planning.</p>
    <p style="font-size:.82rem;color:var(--c2);margin-top:8px">The VPER cycle maps to the four elements (Fire/Air/Earth/Water), which are the same elements that govern your chart. Your elemental balance is your cosmic operating system.</p>`;
  container.appendChild(connCard);

  const ctaDiv = document.createElement('div');
  ctaDiv.style.textAlign = 'center';
  ctaDiv.style.padding   = '20px';
  if (ct.ctaUrl) {
    ctaDiv.innerHTML = `<a href="${ct.ctaUrl}" class="cta-button" target="_blank">${ct.ctaText || 'Explore your full Cosmic Blueprint'}</a>`;
  } else {
    ctaDiv.innerHTML = `<div class="cta-button" style="opacity:.5;cursor:default">Coming Soon</div>`;
  }
  container.appendChild(ctaDiv);
}

/* ---------- #systems ---------- */
function renderSystems(container) {
  const systems = DATA.systems || [];
  const sa      = DATA.systemsAnalytics || {};

  if (!systems.length) {
    container.innerHTML = '<div class="card"><div class="card-title">Strategy Systems</div><p style="color:var(--c3);font-size:.85rem">No strategy systems configured. Run <code>/strategist</code> to define your recurring routines.</p></div>';
    return;
  }

  const score      = sa.overallScore || 0;
  const scoreColor = score >= 80 ? RAW_ELEM_COLORS.earth : score >= 60 ? '#f9a825' : '#c1554d';
  const scoreCard  = document.createElement('div');
  scoreCard.className = 'systems-score';
  scoreCard.innerHTML = `
    <svg width="120" height="120" viewBox="0 0 120 120" style="display:block;margin:0 auto">
      <circle cx="60" cy="60" r="52" fill="none" stroke="var(--bg3)" stroke-width="8"/>
      <circle cx="60" cy="60" r="52" fill="none" stroke="${scoreColor}" stroke-width="8"
        stroke-dasharray="${(score/100)*326.7} 326.7" stroke-linecap="round" transform="rotate(-90 60 60)"/>
      <text x="60" y="58" text-anchor="middle" font-size="28" font-weight="800" fill="var(--c1)">${score}</text>
      <text x="60" y="74" text-anchor="middle" font-size="9" fill="var(--c3)">EXECUTION</text>
    </svg>
    <div class="score-label" style="margin-top:12px">${sa.consistentSystems || 0} consistent / ${sa.needsAttention || 0} need attention</div>`;
  container.appendChild(scoreCard);

  const DAYS       = ['mon','tue','wed','thu','fri','sat','sun'];
  const DAY_LABELS = ['M','T','W','T','F','S','S'];

  systems.forEach(sys => {
    const rate     = sys.completionRate || 0;
    const needsAtt = rate < 60;
    const elem     = sys.element || AREA_ELEMENT[sys.area] || 'earth';
    const rateColor= rate >= 80 ? RAW_ELEM_COLORS.earth : rate >= 60 ? '#f9a825' : '#c1554d';
    const sysCard  = document.createElement('div');
    sysCard.className = 'system-row' + (needsAtt ? ' needs-attention' : '');
    sysCard.style.borderLeftColor = needsAtt ? '#c1554d' : RAW_ELEM_COLORS[elem];

    let html = `<div class="system-header">
      <div>
        <div class="system-name">${sys.name}</div>
        <div style="font-size:.7rem;color:var(--c3)">${sys.area || ''} \u00B7 ${sys.frequency || ''}</div>
      </div>
      <div class="system-meta">
        <span class="completion-badge" style="background:${rateColor}22;color:${rateColor}">${rate}% <span style="font-size:.6rem;opacity:.7">monthly</span></span>
        <span class="streak-badge">${(sys.streak || 0) > 0 ? '\uD83D\uDD25 ' + (sys.streak||0) + '-day streak' : '\u26A0 no streak'}</span>
      </div>
    </div>`;

    const currentWeek = (sys.tracking && sys.tracking[0]) || {};
    const days        = currentWeek.days || {};
    const targetSet   = new Set(sys.targetDays || []);
    html += '<div class="week-grid">';
    DAYS.forEach((d, i) => { html += `<div class="day-header">${DAY_LABELS[i]}</div>`; });
    DAYS.forEach(d => {
      if (!targetSet.has(d))  html += '<div class="day-cell not-target">\u2014</div>';
      else if (days[d])       html += '<div class="day-cell hit">\u2713</div>';
      else                    html += '<div class="day-cell miss">\u2717</div>';
    });
    html += '</div>';

    const tracking = sys.tracking || [];
    if (tracking.length > 1) {
      html += '<div class="history-sparkline">';
      tracking.slice(0, 4).reverse().forEach(wk => {
        const wkDays = wk.days || {};
        const tgt    = (sys.targetDays || []).length || 1;
        const hit    = Object.values(wkDays).filter(Boolean).length;
        const pct    = Math.round((hit / tgt) * 100);
        const h      = Math.max(2, (pct / 100) * 24);
        const col    = pct >= 80 ? RAW_ELEM_COLORS.earth : pct >= 60 ? '#f9a825' : '#c1554d';
        html += `<div class="bar" style="height:${h}px;background:${col}" title="${wk.week}: ${pct}%"></div>`;
      });
      html += '</div>';
    }

    if (sys.connectedGoal) html += `<div style="font-size:.7rem;color:var(--c3);margin-top:6px">\u2192 Goal: ${sys.connectedGoal}</div>`;

    sysCard.innerHTML = html;
    container.appendChild(sysCard);
  });

  if (sa.bestDay || sa.worstDay) {
    const dayCard = document.createElement('div');
    dayCard.className = 'transit-card';
    let dayHTML = '<div class="transit-card-title">Day-of-Week Execution</div>';
    const dayTotals = {};
    DAYS.forEach(d => { dayTotals[d] = { hit: 0, total: 0 }; });
    systems.forEach(sys => {
      const tSet = new Set(sys.targetDays || []);
      (sys.tracking || []).forEach(wk => {
        const wkDays = wk.days || {};
        DAYS.forEach(d => {
          if (tSet.has(d)) { dayTotals[d].total++; if (wkDays[d]) dayTotals[d].hit++; }
        });
      });
    });
    dayHTML += '<div class="day-summary-chart">';
    DAYS.forEach((d, i) => {
      const pct     = dayTotals[d].total > 0 ? (dayTotals[d].hit / dayTotals[d].total) * 100 : 0;
      const col     = pct >= 80 ? RAW_ELEM_COLORS.earth : pct >= 60 ? '#f9a825' : '#c1554d';
      const isBest  = d === sa.bestDay;
      const isWorst = d === sa.worstDay;
      dayHTML += `<div class="day-col">
        <div class="day-bar-track"><div class="day-bar-fill" style="height:${pct}%;background:${col}"></div></div>
        <div class="day-label" style="${isBest ? 'color:'+RAW_ELEM_COLORS.earth : isWorst ? 'color:#c1554d' : ''}">${DAY_LABELS[i]}</div>
        <div style="font-size:.6rem;color:var(--c3)">${Math.round(pct)}%</div>
      </div>`;
    });
    dayHTML += '</div>';
    if (sa.bestDay) dayHTML += `<div style="font-size:.75rem;color:var(--c2);text-align:center;margin-top:4px">Best: <strong style="color:${RAW_ELEM_COLORS.earth}">${sa.bestDay.charAt(0).toUpperCase()+sa.bestDay.slice(1)}</strong> \u00B7 Worst: <strong style="color:#c1554d">${(sa.worstDay||'').charAt(0).toUpperCase()+(sa.worstDay||'').slice(1)}</strong></div>`;
    dayCard.innerHTML = dayHTML;
    container.appendChild(dayCard);
  }

  const attentionSystems = systems.filter(s => (s.completionRate || 0) < 60);
  if (attentionSystems.length) {
    const attCard = document.createElement('div');
    attCard.className = 'transit-card';
    attCard.style.borderLeft = '4px solid #c1554d';
    let attHTML = '<div class="transit-card-title" style="color:#c1554d">Needs Attention</div>';
    attentionSystems.forEach(s => {
      attHTML += `<div style="padding:6px 0;font-size:.82rem;border-bottom:1px solid var(--bg3);display:flex;justify-content:space-between">
        <span>${s.name}</span>
        <span style="color:#c1554d;font-weight:700">${s.completionRate || 0}%</span>
      </div>`;
    });
    attCard.innerHTML = attHTML;
    container.appendChild(attCard);
  }
}

/* ---------- #alignment ---------- */
function renderAlignment(container) {
  const align   = DATA.alignment || {};
  const goals   = DATA.goals    || {};
  const areas   = DATA.areas    || [];
  const systems = DATA.systems  || [];
  const wa      = DATA.winAnalytics || {};

  if (!goals.annual && !areas.length) {
    container.innerHTML = '<div class="card"><div class="card-title">Alignment</div><p style="color:var(--c3);font-size:.85rem">Not enough data for alignment analysis. Add goals and log wins to see alignment insights.</p></div>';
    return;
  }

  const score      = align.overallScore || 0;
  const scoreColor = score >= 80 ? RAW_ELEM_COLORS.earth : score >= 60 ? '#f9a825' : '#c1554d';
  const scoreCard  = document.createElement('div');
  scoreCard.className = 'alignment-score';
  scoreCard.innerHTML = `
    <svg width="120" height="120" viewBox="0 0 120 120" style="display:block;margin:0 auto">
      <circle cx="60" cy="60" r="52" fill="none" stroke="var(--bg3)" stroke-width="8"/>
      <circle cx="60" cy="60" r="52" fill="none" stroke="${scoreColor}" stroke-width="8"
        stroke-dasharray="${(score/100)*326.7} 326.7" stroke-linecap="round" transform="rotate(-90 60 60)"/>
      <text x="60" y="58" text-anchor="middle" font-size="28" font-weight="800" fill="var(--c1)">${score}</text>
      <text x="60" y="74" text-anchor="middle" font-size="9" fill="var(--c3)">ALIGNMENT</text>
    </svg>
    <div class="score-label" style="margin-top:12px">Goal Coverage ${align.goalCoverage || 0}% \u00B7 Systems Connected ${align.systemsWithGoals || 0}/${(align.systemsWithGoals||0)+(align.systemsOrphaned||0)}</div>`;
  container.appendChild(scoreCard);

  /* Goal-to-Vision Audit */
  const goalAudit = document.createElement('div');
  goalAudit.className = 'audit-section';
  let gaHTML = '<div class="audit-section-title">Goal-to-Vision Coherence</div>';
  const allGoals = [].concat(goals.annual||[]);
  if (allGoals.length) {
    allGoals.forEach(g => {
      const connected = !!g.connectedHhg;
      gaHTML += `<div class="connection-line">
        <div class="conn-dot" style="background:${connected ? RAW_ELEM_COLORS.earth : '#c1554d'}"></div>
        <div class="conn-label">${g.description || g.id}</div>
        <div class="conn-status" style="color:${connected ? RAW_ELEM_COLORS.earth : '#c1554d'}">${connected ? '\u2713 Connected to: ' + g.connectedHhg : '\u26A0 Orphaned'}</div>
      </div>`;
    });
    gaHTML += `<div style="margin-top:8px;font-size:.75rem;color:var(--c2)">${align.goalsWithVision || 0} connected / ${align.goalsOrphaned || 0} orphaned \u2014 ${align.goalCoverage || 0}% coverage</div>`;
  } else {
    gaHTML += '<p style="color:var(--c3);font-size:.82rem">No annual goals set.</p>';
  }
  goalAudit.innerHTML = gaHTML;
  container.appendChild(goalAudit);

  /* Area Balance Heatmap */
  const areaBalance = align.areaBalance || {};
  const balCard     = document.createElement('div');
  balCard.className = 'audit-section';
  let balHTML = '<div class="audit-section-title">Area Balance</div><div class="balance-grid">';
  const overFocused  = new Set(areaBalance.overFocused  || []);
  const underFocused = new Set(areaBalance.underFocused || []);
  ['fire','earth','air','water'].forEach(elem => {
    (ELEMENT_AREAS[elem] || []).forEach(slug => {
      const areaData = areas.find(a => a.id === slug);
      const winCount = areaData ? areaData.winCount90d || 0 : 0;
      let cellClass  = 'balanced';
      if (overFocused.has(slug))                             cellClass = 'hot';
      else if (underFocused.has(slug) || winCount === 0)    cellClass = 'cold';
      balHTML += `<div class="balance-cell ${cellClass}">
        <div style="font-size:.7rem">${(areaData ? areaData.name : slug).split('&')[0].trim()}</div>
        <div style="font-size:.95rem;font-weight:800">${winCount}</div>
        <div style="font-size:.55rem;text-transform:uppercase">${cellClass === 'hot' ? 'over-focused' : cellClass === 'cold' ? 'neglected' : 'balanced'}</div>
      </div>`;
    });
  });
  balHTML += `</div><div style="margin-top:8px;font-size:.72rem;color:var(--c2)">${areaBalance.active || 0} active / ${areaBalance.neglected || 0} neglected areas (last 30 days)</div>`;
  balCard.innerHTML = balHTML;
  container.appendChild(balCard);

  /* Win Distribution */
  const byArea      = wa.byArea || {};
  const areaEntries = Object.entries(byArea).filter(([,d]) => (d.count||0) > 0).sort((a,b) => (b[1].count||0)-(a[1].count||0));
  if (areaEntries.length) {
    const distCard = document.createElement('div');
    distCard.className = 'audit-section';
    let distHTML = '<div class="audit-section-title">Win Distribution</div>';
    const totalWins = areaEntries.reduce((s,[,d]) => s + (d.count||0), 0);
    const maxC      = Math.max(...areaEntries.map(([,d]) => d.count||0), 1);
    areaEntries.forEach(([slug, data]) => {
      const pct    = Math.round(((data.count||0) / totalWins) * 100);
      const barPct = ((data.count||0) / maxC) * 100;
      const elem   = AREA_ELEMENT[slug] || '';
      const col    = RAW_ELEM_COLORS[elem] || '#a8a29e';
      distHTML += `<div class="bar-chart-row">
        <span class="bar-label">${slug}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${barPct}%;background:${col}"></div></div>
        <span class="bar-value" style="${pct > 40 ? 'color:#c1554d;font-weight:700' : ''}">${pct}%</span>
      </div>`;
    });
    distCard.innerHTML = distHTML;
    container.appendChild(distCard);
  }

  /* System-to-Goal Connections */
  if (systems.length) {
    const sysCard = document.createElement('div');
    sysCard.className = 'audit-section';
    let sysHTML = '<div class="audit-section-title">System-to-Goal Connections</div>';
    systems.forEach(s => {
      const connected = !!s.connectedGoal;
      sysHTML += `<div class="connection-line">
        <div class="conn-dot" style="background:${connected ? RAW_ELEM_COLORS.earth : '#f9a825'}"></div>
        <div class="conn-label">${s.name}</div>
        <div class="conn-status" style="color:${connected ? RAW_ELEM_COLORS.earth : '#f9a825'}">${connected ? '\u2713 ' + s.connectedGoal : 'orphaned'}</div>
      </div>`;
    });
    sysHTML += `<div style="margin-top:8px;font-size:.75rem;color:var(--c2)">${align.systemsWithGoals || 0} connected / ${align.systemsOrphaned || 0} orphaned</div>`;
    sysCard.innerHTML = sysHTML;
    container.appendChild(sysCard);
  }

  /* Insights */
  const insights = align.insights || [];
  if (insights.length) {
    const insCard = document.createElement('div');
    insCard.className = 'audit-section';
    let insHTML = '<div class="audit-section-title">Insights</div>';
    insights.forEach(ins => { insHTML += `<div class="insight-card">${ins}</div>`; });
    insCard.innerHTML = insHTML;
    container.appendChild(insCard);
  }

  /* Suggested Actions */
  const suggestions = [];
  if ((areaBalance.neglected || 0) >= 5) suggestions.push({ icon: '\uD83C\uDFAF', text: `${areaBalance.neglected} areas neglected \u2014 try /area-review for a neglected area` });
  if ((align.goalsOrphaned  || 0) > 0)  suggestions.push({ icon: '\uD83D\uDD17', text: `${align.goalsOrphaned} goal(s) not connected to vision \u2014 run /alignment to reconnect` });
  if ((align.systemsOrphaned|| 0) > 0)  suggestions.push({ icon: '\u2699',       text: `${align.systemsOrphaned} system(s) have no goal \u2014 run /strategist to connect them` });
  if (score < 50)                         suggestions.push({ icon: '\uD83D\uDD25', text: 'Low alignment score \u2014 start with /vision to clarify your direction' });

  if (suggestions.length) {
    const actCard = document.createElement('div');
    actCard.className = 'audit-section';
    let actHTML = '<div class="audit-section-title">Suggested Actions</div>';
    suggestions.forEach(s => {
      actHTML += `<div class="action-suggestion"><span class="action-icon">${s.icon}</span>${s.text}</div>`;
    });
    actCard.innerHTML = actHTML;
    container.appendChild(actCard);
  }
}

/* ============================================================
   INIT — async fetch then boot
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error('Server returned ' + res.status);
    DATA = await res.json();
    document.getElementById('loading').style.display = 'none';
  } catch (e) {
    document.getElementById('loading').style.display      = 'none';
    document.getElementById('error-overlay').style.display = 'flex';
    return;
  }

  /* Update header meta */
  const meta = DATA.meta || {};
  if (meta.userName) {
    document.getElementById('header-meta').textContent =
      meta.userName + (meta.generatedAt ? ' \u00B7 ' + meta.generatedAt : '');
    document.title = 'ILOS Dashboard \u2014 ' + meta.userName;
  }

  buildNav();
  initTheme();
  initVperMini();
  navigate();
});
