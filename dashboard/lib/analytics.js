'use strict';

const fs   = require('fs');
const path = require('path');
const { readYaml, readJsonl, readMarkdown, listFiles, parseMarkdownItems, extractName, ROOT } = require('./parser');
const { safeRead } = require('./graceful');

/* ============================================================
   STATIC REFERENCE DATA
   ============================================================ */

const KEY_AREAS = [
  { id: 'health',       name: 'Health & Vitality',              houseNum: 1,  element: 'fire'  },
  { id: 'finances',     name: 'Finances & Resources',            houseNum: 2,  element: 'earth' },
  { id: 'intellectual', name: 'Intellectual & Communication',    houseNum: 3,  element: 'air'   },
  { id: 'home',         name: 'Home & Foundation',               houseNum: 4,  element: 'water' },
  { id: 'creative',     name: 'Creative Expression',             houseNum: 5,  element: 'fire'  },
  { id: 'routines',     name: 'Routines & Service',              houseNum: 6,  element: 'earth' },
  { id: 'love',         name: 'Love & Partnership',              houseNum: 7,  element: 'air'   },
  { id: 'emotional',    name: 'Emotional Depth',                 houseNum: 8,  element: 'water' },
  { id: 'vision',       name: 'Vision & Expansion',              houseNum: 9,  element: 'fire'  },
  { id: 'career',       name: 'Career & Legacy',                 houseNum: 10, element: 'earth' },
  { id: 'social',       name: 'Social & Community',              houseNum: 11, element: 'air'   },
  { id: 'spiritual',    name: 'Spiritual & Transcendence',       houseNum: 12, element: 'water' },
];

const VPER_ELEMENT = { vision: 'fire', plan: 'air', execute: 'earth', review: 'water' };
const SIGN_VPER = {
  aries: 'vision', leo: 'vision', sagittarius: 'vision',
  gemini: 'plan', libra: 'plan', aquarius: 'plan',
  taurus: 'execute', virgo: 'execute', capricorn: 'execute',
  cancer: 'review', scorpio: 'review', pisces: 'review'
};
const SIGN_ELEMENT = {
  aries: 'fire', leo: 'fire', sagittarius: 'fire',
  gemini: 'air', libra: 'air', aquarius: 'air',
  taurus: 'earth', virgo: 'earth', capricorn: 'earth',
  cancer: 'water', scorpio: 'water', pisces: 'water'
};
// House number → area ID
const HOUSE_AREA = {};
KEY_AREAS.forEach(a => { HOUSE_AREA[a.houseNum] = a.id; });

const MOON_PHASE_NAMES = [
  'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
  'Full Moon', 'Waning Gibbous', 'Third Quarter', 'Waning Crescent'
];
const MOON_PHASE_EMOJIS = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'];
const MOON_GUIDANCE = [
  'Set intentions for the new cycle — plant seeds of vision',
  'Take first steps — momentum builds',
  'Push through resistance — decisive action',
  'Refinement phase — polish and prepare for completion',
  'Culmination and clarity — celebrate what has grown',
  'Harvest insights — share your wisdom',
  'Release what no longer serves — create space',
  'Rest and reflect before the next cycle begins'
];

/* ============================================================
   HELPERS
   ============================================================ */

function today() { return new Date(); }

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function toDateObj(str) {
  if (!str) return null;
  return new Date(str + 'T00:00:00');
}

function isoWeek(date) {
  const d = new Date(date);
  d.setHours(0,0,0,0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 'W' + String(1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)).padStart(2, '0');
}

/* ============================================================
   WIN ANALYTICS
   ============================================================ */

function computeWinAnalytics(wins) {
  const now = today();
  const cutoff90 = daysAgo(90);
  const cutoff30 = daysAgo(30);

  const recent = wins.filter(w => {
    const d = toDateObj(w.date);
    return d && d >= cutoff90;
  });

  const total90d = recent.length;
  const weeklyAvg = Math.round((total90d / 13) * 10) / 10;

  // byArea: count + 4-week trend
  const byArea = {};
  KEY_AREAS.forEach(a => { byArea[a.id] = { count: 0, trend: [0, 0, 0, 0] }; });

  // week buckets: week-1 (most recent), week-2, week-3, week-4
  const weekBuckets = [daysAgo(7), daysAgo(14), daysAgo(21), daysAgo(28)];

  recent.forEach(w => {
    const area = w.area;
    if (!byArea[area]) byArea[area] = { count: 0, trend: [0, 0, 0, 0] };
    byArea[area].count++;
    const d = toDateObj(w.date);
    for (let i = 0; i < 4; i++) {
      if (d >= weekBuckets[i]) {
        byArea[area].trend[i]++;
        break;
      }
    }
  });
  // trend is stored oldest→newest (reverse from how we built it)
  Object.values(byArea).forEach(a => { a.trend = a.trend.reverse(); });

  // byWeek: last 13 weeks
  const byWeekMap = {};
  recent.forEach(w => {
    const d = toDateObj(w.date);
    if (!d) return;
    const wk = isoWeek(d);
    byWeekMap[wk] = (byWeekMap[wk] || 0) + 1;
  });
  const byWeek = [];
  for (let i = 12; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const wk = isoWeek(d);
    byWeek.push({ week: wk, count: byWeekMap[wk] || 0 });
  }

  // Streak calculation: consecutive days (up to today) with >= 1 win
  const winDates = new Set(wins.map(w => w.date).filter(Boolean));

  let currentStreak = 0;
  let checkDate = new Date(now);
  checkDate.setHours(0,0,0,0);
  // Allow today OR yesterday as "current"
  while (true) {
    const iso = checkDate.toISOString().slice(0, 10);
    if (winDates.has(iso)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (currentStreak === 0) {
      // Skip today if no wins yet
      checkDate.setDate(checkDate.getDate() - 1);
      const iso2 = checkDate.toISOString().slice(0, 10);
      if (winDates.has(iso2)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    } else {
      break;
    }
  }

  let longestStreak = 0;
  let tempStreak = 0;
  const sortedDates = [...winDates].sort();
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) { tempStreak = 1; continue; }
    const prev = new Date(sortedDates[i-1] + 'T00:00:00');
    const curr = new Date(sortedDates[i] + 'T00:00:00');
    const diff = (curr - prev) / 86400000;
    if (diff === 1) { tempStreak++; }
    else { tempStreak = 1; }
    if (tempStreak > longestStreak) longestStreak = tempStreak;
  }
  if (tempStreak > longestStreak) longestStreak = tempStreak;

  return { total90d, weeklyAvg, byArea, byWeek, longestStreak, currentStreak };
}

/* ============================================================
   GOAL ENRICHMENT
   ============================================================ */

function enrichGoals(goalsYaml) {
  if (!goalsYaml) return { annual: [], quarterly: [], monthly: [], weekly: [] };

  const scales = ['annual', 'quarterly', 'monthly', 'weekly'];
  const allGoals = {};

  // First pass: collect all goals by id
  scales.forEach(scale => {
    const section = goalsYaml[scale];
    if (!section || !section.goals) return;
    section.goals.forEach(g => {
      allGoals[g.id] = { ...g, scale };
    });
  });

  // Enrich key_results with pct
  Object.values(allGoals).forEach(g => {
    if (g.key_results) {
      g.keyResults = g.key_results.map(kr => ({
        description: kr.description,
        target: kr.target,
        current: kr.current || 0,
        pct: kr.target ? Math.round(((kr.current || 0) / kr.target) * 100) : 0
      }));
    }
    if (g.connected_hhg !== undefined) g.connectedHhg = g.connected_hhg;
    if (g.parent_goal !== undefined) g.parentGoal = g.parent_goal;
    if (g.connected_goal !== undefined) g.connectedGoal = g.connected_goal;
  });

  // Build childGoals links
  Object.values(allGoals).forEach(g => {
    if (g.parentGoal && allGoals[g.parentGoal]) {
      const parent = allGoals[g.parentGoal];
      if (!parent.childGoals) parent.childGoals = [];
      parent.childGoals.push(g.id);
    }
  });

  const result = {};
  scales.forEach(scale => {
    const section = goalsYaml[scale];
    result[scale] = (section && section.goals)
      ? section.goals.map(g => allGoals[g.id])
      : [];
  });
  return result;
}

/* ============================================================
   AREA ENRICHMENT
   ============================================================ */

function enrichAreas(winAnalytics, goals, projectList) {
  // All active goal IDs per area
  const activeGoalsByArea = {};
  ['annual','quarterly','monthly','weekly'].forEach(scale => {
    (goals[scale] || []).filter(g => g.status === 'active').forEach(g => {
      if (!activeGoalsByArea[g.area]) activeGoalsByArea[g.area] = [];
      activeGoalsByArea[g.area].push(g.id);
    });
  });

  // Projects per area
  const projectsByArea = {};
  (projectList || []).forEach(p => {
    if (!projectsByArea[p.area]) projectsByArea[p.area] = 0;
    projectsByArea[p.area]++;
  });

  return KEY_AREAS.map(area => {
    const areaWins = winAnalytics.byArea[area.id] || { count: 0, trend: [0,0,0,0] };
    const winCount90d = areaWins.count;
    const winTrend = areaWins.trend;
    const projectCount = projectsByArea[area.id] || 0;
    const activeGoals = activeGoalsByArea[area.id] || [];
    const hasGoal = activeGoals.length > 0;

    // Health score: wins(40%) + goals(25%) + projects(20%) + trend(15%)
    const winsScore    = Math.min(winCount90d / 10, 1.0) * 40;
    const goalsScore   = hasGoal ? 25 : 0;
    const projectScore = Math.min(projectCount / 3, 1.0) * 20;
    const week1  = winTrend[3] || 0;
    const week23avg = ((winTrend[1] || 0) + (winTrend[2] || 0)) / 2;
    const trendDir = week1 > week23avg ? 1.0 : week1 < week23avg ? 0.0 : 0.5;
    const trendScore = trendDir * 15;
    const healthScore = Math.round(winsScore + goalsScore + projectScore + trendScore);

    return {
      id: area.id,
      name: area.name,
      houseNum: area.houseNum,
      element: area.element,
      winCount90d,
      winTrend,
      projectCount,
      activeGoals,
      hasGoal,
      healthScore
    };
  });
}

/* ============================================================
   PROJECT PARSING
   ============================================================ */

function parseProjects() {
  const projectDir = path.join(ROOT, 'SPACE/projects');
  if (!fs.existsSync(projectDir)) return [];

  const files = fs.readdirSync(projectDir).filter(f =>
    (f.endsWith('.md') || f.endsWith('.yaml')) &&
    f !== 'README.md' &&
    !f.startsWith('_')
  );
  const projects = [];
  files.forEach(f => {
    const fullPath = path.join(projectDir, f);
    const content = fs.readFileSync(fullPath, 'utf8');
    // Try to extract id, title, status, area from frontmatter or headings
    let id = path.basename(f, path.extname(f));
    let title = id;
    let status = 'active';
    let area = null;
    let connectedGoal = null;

    // YAML frontmatter
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (fmMatch) {
      try {
        const fm = require('js-yaml').load(fmMatch[1]);
        if (fm.title) title = fm.title;
        if (fm.status) status = fm.status;
        if (fm.area) area = fm.area;
        if (fm.id) id = fm.id;
        if (fm.connected_goal) connectedGoal = fm.connected_goal;
      } catch (_) {}
    } else {
      // Try first heading
      const h1 = content.match(/^#\s+(.+)/m);
      if (h1) title = h1[1].trim();
    }
    projects.push({ id, title, status, area, connectedGoal });
  });
  return projects;
}

/* ============================================================
   VISION PARSING
   ============================================================ */

function parseVision() {
  // FPs: bullets and numbered items only — skip headings (they are category groupers)
  const fps = safeRead(() =>
    parseMarkdownItems(readMarkdown('QUANTUM/Vision/favorite-problems.md'),
      { bulletsOnly: true, stripBold: true })
  ) || [];

  // MTPs: H2 headings = MTP titles; fall back to H3 if no H2 found
  const mtps = safeRead(() => {
    const text = readMarkdown('QUANTUM/Vision/massively-transformative-purposes.md');
    const lvl2 = parseMarkdownItems(text, { headingLevel: 2, stripBold: true });
    return lvl2.length ? lvl2 : parseMarkdownItems(text, { headingLevel: 3, stripBold: true });
  }) || [];

  // HHGs: H3 headings = actual goals (H2 headings are MTP groupers — skip them)
  // Also extract timeframes from parentheses in title
  const hhgs = safeRead(() => {
    const text = readMarkdown('QUANTUM/Vision/high-hard-goals.md');
    return parseMarkdownItems(text, { headingLevel: 3, stripBold: true }).map(item => {
      const m = item.title.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
      return m ? { title: m[1].trim(), timeframe: m[2].trim() } : item;
    });
  }) || [];

  return { fps, mtps, hhgs };
}

/* ============================================================
   TRANSIT COMPUTATION
   ============================================================ */

function computeTransits() {
  const now = today();
  const todayMMDD = (now.getMonth() + 1).toString().padStart(2,'0') + '-' + now.getDate().toString().padStart(2,'0');
  const todayYYYYMM = now.getFullYear() + '-' + (now.getMonth()+1).toString().padStart(2,'0');

  // Sun sign from sign-calendar.yaml
  let sunSign = null, sunElement = null, sunVperPhase = null;
  const signCal = safeRead(() => readYaml('SYSTEM/transit-data/sign-calendar.yaml'));
  if (signCal && signCal.signs) {
    for (const entry of signCal.signs) {
      const start = entry.start; // e.g. "03-21"
      const end = entry.end;     // e.g. "04-19"
      if (spansDate(start, end, todayMMDD)) {
        sunSign = entry.sign.toLowerCase();
        sunElement = SIGN_ELEMENT[sunSign] || null;
        sunVperPhase = SIGN_VPER[sunSign] || null;
        break;
      }
    }
  }

  // Slow planets from slow-planets-2026.yaml
  const slowPlanetsData = safeRead(() => readYaml('SYSTEM/transit-data/slow-planets-2026.yaml'));
  const slowPlanets = [];
  if (slowPlanetsData && slowPlanetsData.planets) {
    slowPlanetsData.planets.forEach(p => {
      const monthEntry = (p.positions || []).find(pos => pos.month === todayYYYYMM);
      if (monthEntry) {
        const sign = monthEntry.sign.toLowerCase();
        slowPlanets.push({
          name: p.name,
          sign,
          element: SIGN_ELEMENT[sign] || null,
          vperPhase: SIGN_VPER[sign] || null
        });
      }
    });
  }

  // Cosmic VPER summary
  const allPositions = [];
  if (sunSign) allPositions.push({ name: 'Sun', sign: sunSign, element: sunElement, vperPhase: sunVperPhase });
  slowPlanets.forEach(p => allPositions.push(p));

  const phaseCounts = { vision: 0, plan: 0, execute: 0, review: 0 };
  allPositions.forEach(p => { if (p.vperPhase) phaseCounts[p.vperPhase]++; });
  let dominantPhase = sunVperPhase || 'execute';
  let maxCount = 0;
  Object.entries(phaseCounts).forEach(([ph, cnt]) => {
    if (cnt > maxCount) { maxCount = cnt; dominantPhase = ph; }
  });

  const activeAreas = allPositions
    .filter(p => p.sign)
    .map(p => {
      // Map sign → house (Aries=1, Taurus=2, ...) → area
      const signOrder = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];
      const houseNum = signOrder.indexOf(p.sign) + 1;
      const areaId = HOUSE_AREA[houseNum];
      const area = KEY_AREAS.find(a => a.id === areaId);
      return area ? { houseNum, areaName: area.name, planet: p.name, element: p.element } : null;
    })
    .filter(Boolean);

  // Elemental weather
  const elemCount = { fire: 0, air: 0, earth: 0, water: 0 };
  allPositions.forEach(p => { if (p.element && elemCount[p.element] !== undefined) elemCount[p.element]++; });
  let dominant = 'fire', weakest = 'fire';
  Object.entries(elemCount).forEach(([el, cnt]) => {
    if (cnt > elemCount[dominant]) dominant = el;
    if (cnt < elemCount[weakest]) weakest = el;
  });
  const weatherSummaries = {
    fire: 'Strong Fire energy — vision, inspiration, and new beginnings',
    air: 'Dominant Air — ideas, communication, and strategic planning',
    earth: 'Earth emphasis — grounding, execution, and tangible progress',
    water: 'Water dominance — reflection, intuition, and emotional depth'
  };
  const elementalWeather = { ...elemCount, dominant, weakest, summary: weatherSummaries[dominant] || '' };

  // Moon phase
  const moonData = safeRead(() => readYaml('SYSTEM/transit-data/moon-phases-2026.yaml'));
  let moonPhase = { name: 'Unknown', emoji: '🌕', illumination: 50, element: 'ether', guidance: '' };
  if (moonData && moonData.phases) {
    const phases = moonData.phases.map(p => ({ ...p, dateObj: new Date(p.date + 'T00:00:00') }))
      .sort((a, b) => a.dateObj - b.dateObj);
    const nowMs = now.getTime();
    let prev = phases[0], next = phases[phases.length - 1];
    for (let i = 0; i < phases.length; i++) {
      if (phases[i].dateObj <= now) prev = phases[i];
      else { next = phases[i]; break; }
    }
    const daysSince = (nowMs - prev.dateObj.getTime()) / 86400000;
    const cycleLength = (next.dateObj.getTime() - prev.dateObj.getTime()) / 86400000;
    const isNewMoon = prev.type === 'new';
    const fullCycle = 29.5;
    // Determine phase index (0-7)
    let dayInCycle;
    if (isNewMoon) {
      dayInCycle = daysSince;
    } else {
      // prev is Full Moon — we're in waning half
      dayInCycle = 14.75 + daysSince;
    }
    dayInCycle = dayInCycle % fullCycle;
    const phaseIdx = Math.floor((dayInCycle / fullCycle) * 8) % 8;
    // Illumination: 0% at New, 100% at Full, interpolate
    let illumination;
    if (dayInCycle <= 14.75) {
      illumination = Math.round((dayInCycle / 14.75) * 100);
    } else {
      illumination = Math.round((1 - (dayInCycle - 14.75) / 14.75) * 100);
    }
    const waxing = dayInCycle <= 14.75;
    moonPhase = {
      name: MOON_PHASE_NAMES[phaseIdx],
      emoji: MOON_PHASE_EMOJIS[phaseIdx],
      illumination: Math.max(0, Math.min(100, illumination)),
      element: waxing ? (phaseIdx < 2 ? 'fire' : 'earth') : (phaseIdx < 6 ? 'water' : 'air'),
      guidance: MOON_GUIDANCE[phaseIdx]
    };
  }

  return {
    date: now.toISOString().slice(0,10),
    sunSign, sunElement, sunVperPhase,
    slowPlanets,
    cosmicVper: { dominantPhase, phaseCounts, activeAreas },
    moonPhase,
    elementalWeather
  };
}

function spansDate(start, end, mmdd) {
  // Handle year-wrapping (Capricorn: 12-22 to 01-19)
  if (start > end) {
    return mmdd >= start || mmdd <= end;
  }
  return mmdd >= start && mmdd <= end;
}

/* ============================================================
   SYSTEMS ANALYTICS
   ============================================================ */

function computeSystems(systemsYaml) {
  if (!systemsYaml || !systemsYaml.systems) return { systems: [], systemsAnalytics: null };

  const systems = systemsYaml.systems.map(sys => {
    const targetDays = sys.target_days || [];
    const tracking = sys.tracking || [];

    // Compute completion rate over last 4 weeks
    let totalTarget = 0, totalDone = 0;
    tracking.forEach(wk => {
      targetDays.forEach(day => {
        if (wk.days && wk.days[day] !== undefined) {
          totalTarget++;
          if (wk.days[day]) totalDone++;
        }
      });
    });
    const completionRate = totalTarget > 0 ? Math.round((totalDone / totalTarget) * 100) : 0;

    // Streak: walk backward through most recent target days
    let streak = 0;
    outer: for (let w = 0; w < tracking.length; w++) {
      const wk = tracking[w];
      for (let d = targetDays.length - 1; d >= 0; d--) {
        const day = targetDays[d];
        if (wk.days && wk.days[day] !== undefined) {
          if (wk.days[day]) streak++;
          else break outer;
        }
      }
    }

    // Trend
    const weekRates = tracking.slice(0, 4).map(wk => {
      let t = 0, d = 0;
      targetDays.forEach(day => {
        if (wk.days && wk.days[day] !== undefined) { t++; if (wk.days[day]) d++; }
      });
      return t > 0 ? d / t : 0;
    });
    const week1Rate = weekRates[0] || 0;
    const week23Avg = weekRates.length >= 3 ? (weekRates[1] + weekRates[2]) / 2 : week1Rate;
    let trend = 'flat';
    if (week1Rate > week23Avg + 0.05) trend = 'rising';
    else if (week1Rate < week23Avg - 0.05) trend = 'falling';

    return {
      id: sys.id,
      name: sys.name,
      frequency: sys.frequency,
      area: sys.area,
      element: sys.element,
      connectedGoal: sys.connected_goal || null,
      targetDays,
      tracking,
      completionRate,
      streak,
      trend
    };
  });

  // Aggregate analytics
  const overallScore = systems.length > 0
    ? Math.round(systems.reduce((s, sys) => s + sys.completionRate, 0) / systems.length)
    : 0;
  const consistentSystems = systems.filter(s => s.completionRate > 80).length;
  const needsAttention = systems.filter(s => s.completionRate < 60).length;

  // Best/worst day
  const dayTotals = { mon:0, tue:0, wed:0, thu:0, fri:0, sat:0, sun:0 };
  const dayTargets = { mon:0, tue:0, wed:0, thu:0, fri:0, sat:0, sun:0 };
  systems.forEach(sys => {
    sys.tracking.forEach(wk => {
      sys.targetDays.forEach(day => {
        if (wk.days && wk.days[day] !== undefined) {
          dayTargets[day]++;
          if (wk.days[day]) dayTotals[day]++;
        }
      });
    });
  });
  const dayRates = {};
  const DAYS = ['mon','tue','wed','thu','fri','sat','sun'];
  DAYS.forEach(d => {
    dayRates[d] = dayTargets[d] > 0 ? dayTotals[d] / dayTargets[d] : null;
  });
  const activeDays = DAYS.filter(d => dayTargets[d] > 0);
  const bestDay  = activeDays.sort((a,b) => (dayRates[b]||0) - (dayRates[a]||0))[0] || null;
  const worstDay = activeDays.sort((a,b) => (dayRates[a]||0) - (dayRates[b]||0))[0] || null;

  // Weekly trend (4 weeks, oldest first)
  const allWeeks = [];
  for (let w = 3; w >= 0; w--) {
    let t = 0, d = 0;
    systems.forEach(sys => {
      const wk = sys.tracking[w];
      if (!wk) return;
      sys.targetDays.forEach(day => {
        if (wk.days && wk.days[day] !== undefined) { t++; if (wk.days[day]) d++; }
      });
    });
    allWeeks.push(t > 0 ? Math.round((d / t) * 100) : 0);
  }

  return {
    systems,
    systemsAnalytics: { overallScore, totalSystems: systems.length, consistentSystems, needsAttention, bestDay, worstDay, weeklyTrend: allWeeks }
  };
}

/* ============================================================
   ALIGNMENT ANALYTICS
   ============================================================ */

function computeAlignment(goals, areas, systems, wins) {
  const allGoals = [
    ...(goals.annual || []),
    ...(goals.quarterly || []),
    ...(goals.monthly || []),
    ...(goals.weekly || [])
  ].filter(g => g.status === 'active');

  // Build lookup for connected_hhg
  const annualById = {};
  (goals.annual || []).forEach(g => { annualById[g.id] = g; });

  let goalsWithVision = 0, goalsOrphaned = 0;
  allGoals.forEach(g => {
    // Trace parent chain to annual → connectedHhg
    let cur = g;
    let connected = false;
    for (let depth = 0; depth < 5; depth++) {
      if (cur.connectedHhg) { connected = true; break; }
      if (!cur.parentGoal) break;
      cur = allGoals.find(x => x.id === cur.parentGoal) || annualById[cur.parentGoal] || cur;
      if (cur === g) break;
    }
    if (connected) goalsWithVision++;
    else goalsOrphaned++;
  });
  const totalGoals = allGoals.length;
  const goalCoverage = totalGoals > 0 ? Math.round((goalsWithVision / totalGoals) * 100) : 0;

  // Area balance (30 days)
  const cutoff30 = daysAgo(30);
  const recentWins30 = wins.filter(w => {
    const d = toDateObj(w.date);
    return d && d >= cutoff30;
  });
  const areaWins30 = {};
  recentWins30.forEach(w => { areaWins30[w.area] = (areaWins30[w.area] || 0) + 1; });
  const activeAreas30 = KEY_AREAS.filter(a => (areaWins30[a.id] || 0) > 0).length;
  const neglected = 12 - activeAreas30;
  const totalWins30 = recentWins30.length;
  const overFocused = KEY_AREAS.filter(a => totalWins30 > 0 && (areaWins30[a.id] || 0) / totalWins30 > 0.40).map(a => a.id);
  const activeGoalAreaIds = new Set([
    ...(goals.annual || []), ...(goals.quarterly || []), ...(goals.monthly || []), ...(goals.weekly || [])
  ].filter(g => g.status === 'active').map(g => g.area));
  const underFocused = KEY_AREAS.filter(a => (areaWins30[a.id] || 0) === 0 && activeGoalAreaIds.has(a.id)).map(a => a.id);
  const areaBalanceScore = Math.round((activeAreas30 / 12) * 100);
  const areaBalance = { active: activeAreas30, neglected, overFocused, underFocused };

  // Systems to goals
  const activeGoalIds = new Set(allGoals.map(g => g.id));
  const systemsWithGoals = systems.filter(s => s.connectedGoal && activeGoalIds.has(s.connectedGoal)).length;
  const systemsOrphaned = systems.filter(s => !s.connectedGoal || !activeGoalIds.has(s.connectedGoal)).length;
  const systemsGoalScore = systems.length > 0 ? Math.round((systemsWithGoals / systems.length) * 100) : 50;

  const overallScore = Math.round(goalCoverage * 0.40 + areaBalanceScore * 0.30 + systemsGoalScore * 0.30);

  // Insights
  const insights = [];
  if (neglected > 6) insights.push(`${neglected} of 12 life areas have received no attention in the last 30 days`);
  if (goalsOrphaned > 0) insights.push(`${goalsOrphaned} goal(s) have no connection to your vision — consider cutting or connecting`);
  overFocused.forEach(areaId => {
    const area = KEY_AREAS.find(a => a.id === areaId);
    const pct = Math.round((areaWins30[areaId] / totalWins30) * 100);
    if (area) insights.push(`Your ${area.name} area has ${pct}% of all wins — strong focus, but check balance`);
  });
  if (systemsOrphaned > 0) insights.push(`${systemsOrphaned} system(s) aren't connected to any goal — consider linking or removing`);
  if (overallScore > 80) insights.push('Strong alignment — your actions reflect your vision');
  if (insights.length === 0) insights.push('Keep logging wins and connecting your goals to build alignment insights');

  return { goalCoverage, goalsWithVision, goalsOrphaned, areaBalance, systemsWithGoals, systemsOrphaned, overallScore, insights };
}

/* ============================================================
   META COMPUTATION
   ============================================================ */

function computeMeta(period, userName) {
  const now = today();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const quarter = 'Q' + Math.ceil((now.getMonth() + 1) / 3);
  const week = isoWeek(now);
  const generatedAt = now.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  return {
    generatedAt,
    userName: userName || 'ILOS User',
    currentWeek: period ? (period.current_week || week) : week,
    currentMonth: period ? (period.current_month || month) : month,
    currentQuarter: period ? (period.current_quarter || quarter) : quarter,
    currentYear: period ? (period.current_year || year) : year,
  };
}

/* ============================================================
   EDUCATION DATA
   ============================================================ */

function parseEducation() {
  const sources = {
    vper:       'ILOS-KNOWLEDGE/vper-cycle.md',
    elements:   'ILOS-KNOWLEDGE/elemental-wisdom.md',
    gapToGain:  'ILOS-KNOWLEDGE/gap-to-gain.md',
    areas:      'ILOS-KNOWLEDGE/aligned-goal-setting.md',
    goals:      'ILOS-KNOWLEDGE/aligned-goal-setting.md',
    planning:   'ILOS-KNOWLEDGE/intentional-planning-cycle.md'
  };

  function parseSectionsAndQuotes(text) {
    const sections = [];
    const quotes = [];
    const lines = text.split('\n');
    let currentHeading = null;
    let contentLines = [];

    const flush = () => {
      if (currentHeading) {
        sections.push({ heading: currentHeading, content: contentLines.join('\n').trim() });
      }
    };

    lines.forEach(line => {
      if (line.startsWith('## ')) {
        flush();
        currentHeading = line.slice(3).trim();
        contentLines = [];
      } else if (line.startsWith('> ') && !line.startsWith('> —')) {
        quotes.push({ text: line.slice(2).trim(), attribution: '' });
      } else {
        if (line.startsWith('> — ') && quotes.length > 0) {
          quotes[quotes.length - 1].attribution = line.slice(4).trim();
        } else {
          contentLines.push(line);
        }
      }
    });
    flush();
    return { sections, quotes };
  }

  const edu = {};
  Object.entries(sources).forEach(([key, relPath]) => {
    const text = safeRead(() => readMarkdown(relPath));
    if (text) {
      edu[key] = parseSectionsAndQuotes(text);
    } else {
      edu[key] = { sections: [], quotes: [] };
    }
  });
  return edu;
}

/* ============================================================
   COSMIC TEASER
   ============================================================ */

function computeCosmicTeaser() {
  const profile = safeRead(() => readYaml('QUANTUM/self-knowledge/cosmic-profile.yaml'));
  const hasBirthData = !!(profile && profile.birth_data);
  const astro = profile && profile.astrology || {};
  const hd   = profile && profile.human_design || {};
  const gk   = profile && profile.gene_keys || {};
  return {
    hasBirthData,
    sunSign:         astro.sun_sign        || null,
    moonSign:        astro.moon_sign       || null,
    ascendant:       astro.ascendant       || null,
    dominantElement: astro.dominant_element || null,
    hdType:          hd.type               || null,
    hdAuthority:     hd.authority          || null,
    hdProfile:       hd.profile            || null,
    hdDefinition:    hd.definition         || null,
    gkLifesWork:     gk.lifes_work         || null,
    ctaUrl:  'https://cosmicblueprint.app',
    ctaText: 'Explore your full Cosmic Blueprint'
  };
}

/* ============================================================
   DECISIONS ANALYTICS
   ============================================================ */

function computeDecisions() {
  const all = (safeRead(() => readJsonl('MEMORY/decisions.jsonl')) || [])
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const open      = all.filter(d => d.status === 'open');
  const decided   = all.filter(d => d.status === 'decided');
  const setAside  = all.filter(d => d.status === 'set_aside');

  const todayStr = today().toISOString().slice(0, 10);
  const pendingReview = decided.filter(d => d.review_date && d.review_date <= todayStr);

  const confidenceValues = decided.filter(d => typeof d.confidence === 'number').map(d => d.confidence);
  const avgConfidence = confidenceValues.length
    ? Math.round(confidenceValues.reduce((s, v) => s + v, 0) / confidenceValues.length * 10) / 10
    : null;

  const byArea = {};
  all.forEach(d => {
    if (d.area) byArea[d.area] = (byArea[d.area] || 0) + 1;
  });

  return { all, open, decided, setAside, pendingReview, avgConfidence, byArea };
}

/* ============================================================
   LESSONS (FAILURES) ANALYTICS
   ============================================================ */

function computeLessons() {
  const all = (safeRead(() => readJsonl('MEMORY/failures.jsonl')) || [])
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const bySeverity = { low: 0, medium: 0, high: 0 };
  const byArea = {};
  let withPrevention = 0;

  all.forEach(l => {
    if (l.severity && bySeverity[l.severity] !== undefined) bySeverity[l.severity]++;
    if (l.area) byArea[l.area] = (byArea[l.area] || 0) + 1;
    if (l.prevention && l.prevention.trim()) withPrevention++;
  });

  const topAreas = Object.entries(byArea)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, count]) => {
      const area = KEY_AREAS.find(a => a.id === id);
      return { id, name: area ? area.name : id, count };
    });

  return { all, bySeverity, byArea, withPrevention, topAreas };
}

/* ============================================================
   EXPERIENCES ANALYTICS
   ============================================================ */

function computeExperiences() {
  const all = (safeRead(() => readJsonl('MEMORY/experiences.jsonl')) || [])
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const byElement = { fire: 0, air: 0, earth: 0, water: 0, ether: 0 };
  const byArea = {};
  const highEmotional = [];
  const cutoff90 = daysAgo(90);

  all.forEach(e => {
    if (e.element && byElement[e.element] !== undefined) byElement[e.element]++;
    if (e.area) byArea[e.area] = (byArea[e.area] || 0) + 1;
    if (typeof e.emotional_weight === 'number' && e.emotional_weight >= 8) highEmotional.push(e);
  });

  const recentInsights = all.filter(e => {
    if (!e.insight || !e.insight.trim()) return false;
    const d = toDateObj(e.date);
    return d && d >= cutoff90;
  });

  return { all, byElement, byArea, highEmotional, recentInsights };
}

/* ============================================================
   MAIN: buildData()
   ============================================================ */

function buildData() {
  // 1. Load raw data (all graceful)
  const period    = safeRead(() => readYaml('TIME/current-period.yaml'));
  const goalsYaml = safeRead(() => readYaml('TIME/active-goals.yaml'));
  const systemsYaml = safeRead(() => readYaml('TIME/strategy-systems.yaml'));
  const rawWins   = safeRead(() => readJsonl('MEMORY/wins.jsonl')) || [];
  const manifestoText = safeRead(() => readMarkdown('QUANTUM/personal-context/0-life-vision-manifesto.md'));
  const userName  = extractName(manifestoText) || 'ILOS User';

  // 2. Compute derived data
  const goals      = enrichGoals(goalsYaml);
  const winAnalytics = computeWinAnalytics(rawWins);
  const projectList  = safeRead(parseProjects) || [];
  const areas        = enrichAreas(winAnalytics, goals, projectList);
  const vision       = parseVision();
  const transits     = safeRead(computeTransits) || null;
  const { systems, systemsAnalytics } = computeSystems(systemsYaml);
  const alignment    = computeAlignment(goals, areas, systems, rawWins);
  const education    = safeRead(parseEducation) || {};
  const cosmicTeaser = computeCosmicTeaser();
  const meta         = computeMeta(period, userName);

  // 3. VPER (include lastReviews for review consistency tracker)
  const vper = period ? {
    phase: period.vper_phase || null,
    phaseStarted: period.phase_started || null,
    elementFocus: period.element_focus || null,
    elementalBalance: period.elemental_balance || {},
    lastReviews: period.last_reviews || {}
  } : {};

  // 4. Memory analytics (decisions, lessons, experiences)
  const decisions    = computeDecisions();
  const lessons      = computeLessons();
  const experiences  = computeExperiences();

  return {
    meta,
    vper,
    goals,
    wins: rawWins,
    winAnalytics,
    areas,
    projects: projectList,
    vision,
    education,
    transits,
    cosmicTeaser,
    systems,
    systemsAnalytics,
    alignment,
    decisions,
    lessons,
    experiences
  };
}

module.exports = { buildData };
