#!/usr/bin/env node
'use strict';
// Fills SYSTEM/tana-ids.yaml from the older Markdown ID tables and the duplicate IDs in
// sync-state.yaml. Dry-run by default; nothing is written without --write. Never overwrites a
// value that is already set. The report lists key names only, never IDs.
//
//   node SYSTEM/tools/migrate-ids.js [templateRoot] [--write]
//
// If you cannot run Node, an agent can do the same by hand: for every table row below, copy the
// ID into the matching blank key of SYSTEM/tana-ids.yaml (rules are in buildIds()).

const fs = require('fs');
const path = require('path');

const AREA_SLUGS = ['health', 'finances', 'intellectual', 'home', 'creative', 'routines',
  'love', 'emotional', 'vision', 'career', 'social', 'spiritual'];
const TAG_EXCEPTIONS = { 'massively transformative purpose': 'MTP_TAG_ID', 'high hard goal': 'HHG_TAG_ID' };
const HUBS = {
  'vision hub': 'VISION_HUB_ID',
  'life overview hub': 'LIFE_OVERVIEW_HUB_ID',
  'planning hub': 'PLANNING_HUB_ID',
  'personal context hub': 'PERSONAL_CONTEXT_HUB_ID',
};
const CONTAINERS = {
  'wins log': 'WINS_CONTAINER_ID',
  'decisions log': 'DECISIONS_CONTAINER_ID',
  goals: 'GOALS_CONTAINER_ID',
  projects: 'PROJECTS_CONTAINER_ID',
  topics: 'TOPICS_CONTAINER_ID',
  'favorite problems': 'VISION_FP_CONTAINER_ID',
  'massively transformative purposes': 'VISION_MTP_CONTAINER_ID',
  'high hard goals': 'VISION_HHG_CONTAINER_ID',
};
const STATE_FALLBACKS = {
  favorite_problems_container: 'VISION_FP_CONTAINER_ID',
  mtps_container: 'VISION_MTP_CONTAINER_ID',
  hhgs_container: 'VISION_HHG_CONTAINER_ID',
  context_container: 'PERSONAL_CONTEXT_HUB_ID',
};

const upper = (s) => s.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
const clean = (cell) => (cell || '').replace(/`/g, '').trim();

function tableRows(md) {
  const rows = [];
  let section = '';
  for (const line of md.split('\n')) {
    const h = line.match(/^#{1,6}\s+(.*)$/);
    if (h) { section = h[1].trim(); continue; }
    if (!line.trim().startsWith('|')) continue;
    const cells = line.trim().replace(/^\||\|$/g, '').split('|').map(clean);
    if (cells.every((c) => /^:?-+:?$/.test(c))) continue;
    rows.push({ section, cells });
  }
  return rows;
}

function buildIds({ idsText, tagMd = '', fieldMd = '', structureMd = '', stateText = '' }) {
  const found = {};
  const conflicts = [];
  const unmapped = [];
  const put = (key, value) => {
    if (!value) return;
    if (found[key] && found[key] !== value) { if (!conflicts.includes(key)) conflicts.push(key); return; }
    found[key] = found[key] || value;
  };

  for (const { cells } of tableRows(tagMd)) {
    const [name, id] = cells;
    if (!name.startsWith('#') || name.toLowerCase() === 'tag name') continue;
    const bare = name.replace(/^#/, '').trim().toLowerCase();
    const key = TAG_EXCEPTIONS[bare] || `${upper(bare)}_TAG_ID`;
    if (id) put(key, id);
  }

  const known = new Set([...idsText.matchAll(/^\s+([A-Z][A-Z0-9_]*_ID):/gm)].map((m) => m[1]));
  for (const { section, cells } of tableRows(fieldMd)) {
    const [name, id] = cells;
    if (!name || /^(field name|option)$/i.test(name)) continue;
    if (/ options$/i.test(section)) {
      const prefix = upper(section.replace(/ options$/i, '').replace(/ status$/i, ''));
      put(`${prefix}_${upper(name)}_OPTION_ID`, id);
    } else {
      const key = `${upper(name)}_FIELD_ID`;
      if (known.has(key)) put(key, id); else if (id) unmapped.push(`field: ${name}`);
    }
  }

  for (const { section, cells } of tableRows(structureMd)) {
    const [name, second, third] = cells;
    if (!name || /^(name|hub name|container|#)$/i.test(name)) continue;
    const sec = section.toLowerCase();
    if (sec === 'workspace') put('WORKSPACE_ID', second);
    else if (sec === 'home node') put('HOME_NODE_ID', second);
    else if (sec === 'hubs' && HUBS[name.toLowerCase()]) put(HUBS[name.toLowerCase()], second);
    else if (sec.startsWith('containers') && CONTAINERS[name.toLowerCase()]) put(CONTAINERS[name.toLowerCase()], second);
    else if (sec === 'key area nodes' && /^\d+$/.test(name)) {
      const slug = AREA_SLUGS[Number(name) - 1];
      if (slug) put(`area:${slug}`, third);
    }
  }

  // sync-state duplicates: fallback only
  const fallback = {};
  for (const [stateKey, idsKey] of Object.entries(STATE_FALLBACKS)) {
    const m = stateText.match(new RegExp(`${stateKey}:\\s*"([^"]+)"`));
    if (m) fallback[idsKey] = m[1];
  }
  const areasBlock = (stateText.match(/\n {2}areas:\n([\s\S]*?)(?=\n {2}[a-z_]+:\n|\s*$)/) || [])[1] || '';
  for (const slug of AREA_SLUGS) {
    const m = areasBlock.match(new RegExp(`^\\s+${slug}:\\s*"([^"]+)"`, 'm'));
    if (m) fallback[`area:${slug}`] = m[1];
  }
  for (const [k, v] of Object.entries(fallback)) if (!found[k]) found[k] = v;

  const filled = [];
  let text = idsText;
  for (const [key, value] of Object.entries(found)) {
    const name = key.startsWith('area:') ? key.slice(5) : key;
    const re = new RegExp(`^(\\s+${name}:\\s*)""(\\s*(?:#.*)?)$`, 'm');
    if (re.test(text)) {
      text = text.replace(re, `$1"${value}"$2`);
      filled.push(name);
    }
  }
  const blanks = [...text.matchAll(/^\s+([A-Za-z][A-Za-z0-9_]*):\s*""\s*(?:#.*)?$/gm)].map((m) => m[1]);
  return { text, filled, blanks, unmapped, conflicts };
}

module.exports = { buildIds };

if (require.main === module) {
  const args = process.argv.slice(2);
  const write = args.includes('--write');
  const root = path.resolve(args.find((a) => !a.startsWith('--')) || process.cwd());
  const rd = (p) => (fs.existsSync(path.join(root, p)) ? fs.readFileSync(path.join(root, p), 'utf8') : '');
  const idsPath = path.join(root, 'SYSTEM', 'tana-ids.yaml');
  const r = buildIds({
    idsText: fs.readFileSync(idsPath, 'utf8'),
    tagMd: rd('SYSTEM/tana-reference/tag-ids.md'),
    fieldMd: rd('SYSTEM/tana-reference/field-ids.md'),
    structureMd: rd('SYSTEM/tana-reference/structure-map.md'),
    stateText: rd('SYSTEM/sync-state.yaml'),
  });
  console.log(`filled ${r.filled.length}: ${r.filled.join(', ') || '-'}`);
  console.log(`still blank ${r.blanks.length}: ${r.blanks.join(', ') || '-'}`);
  if (r.unmapped.length) console.log(`rows with no matching key (ignored): ${r.unmapped.join('; ')}`);
  if (r.conflicts.length) console.log(`kept the first value, later rows differed: ${r.conflicts.join(', ')}`);
  if (write) {
    fs.writeFileSync(idsPath, r.text);
    console.log('wrote SYSTEM/tana-ids.yaml');
  } else {
    console.log('dry run: nothing written (use --write)');
  }
}
