#!/usr/bin/env node
'use strict';
// Static guard for the Tana write contract in skills and agent files.
//
//   node SYSTEM/tools/skill-lint.js [templateRoot]     (exits 1 on violations)
//
// The contract: wins and decisions are pushed to the resolved wins/decisions container
// (never to a calendar node), every push is recorded in sync-state.yaml so /sync can
// dedup, container IDs honour tana_node_overrides, wins always set Periodicity (never Day),
// an empty ID skips the push instead of improvising, and nothing selects wins by the
// legacy last_pushed_win_id cursor.

const fs = require('fs');
const path = require('path');

const FENCE = /^\s*(```|~~~)/;
const WIN_TAG = /\bWIN_TAG_ID\b|#win\b/;
const DECISION_TAG = /\bDECISION_TAG_ID\b|#decision\b/;
const CONTAINER = { win: '[WINS_CONTAINER_ID_RESOLVED]', decision: '[DECISIONS_CONTAINER_ID_RESOLVED]' };

// Returns every fenced block (``` or ~~~). A fence still open at the end of the text is
// returned too, with unclosed: true, so its content is linted instead of silently dropped.
function fencedBlocks(text) {
  const blocks = [];
  let open = null;
  text.split('\n').forEach((line, i) => {
    const m = line.match(FENCE);
    if (m && open === null) {
      open = { line: i + 1, marker: m[1], lines: [] };
    } else if (m && m[1] === open.marker) {
      blocks.push({ line: open.line, text: open.lines.join('\n') });
      open = null;
    } else if (open !== null) {
      open.lines.push(line);
    }
  });
  if (open !== null) blocks.push({ line: open.line, text: open.lines.join('\n'), unclosed: true });
  return blocks;
}

function lintText(file, text) {
  const out = [];
  const add = (line, rule, message) => out.push({ file, line, rule, message });

  text.split('\n').forEach((line, i) => {
    const m = line.match(/\[[A-Z_]+_CONTAINER_ID\]/);
    if (m) {
      add(i + 1, 'unresolved-container',
        `${m[0]} must be written as [..._CONTAINER_ID_RESOLVED] after resolving it from tana_node_overrides or structure-map.md`);
    }
    if (/\b(after|since|beyond)\s+(?:the\s+)?`?(?:entities\.\w+\.)?last_pushed_(win|decision)_id/i.test(line) && !/\b(never|not)\b/i.test(line)) {
      add(i + 1, 'cursor-push',
        'select what to push by the tana_node_ids map, never by the last_pushed_*_id cursor: map-based pushes are not in cursor order');
    }
  });

  let firstPush = null;
  let pushesWin = false;
  for (const block of fencedBlocks(text)) {
    if (block.unclosed) add(block.line, 'unclosed-fence', 'fenced block is never closed; the lint cannot tell where it ends');
    const pushes = /import_tana_paste/.test(block.text);
    const kinds = [];
    if (pushes && WIN_TAG.test(block.text)) kinds.push('win');
    if (pushes && DECISION_TAG.test(block.text)) kinds.push('decision');
    if (!kinds.length) continue;
    if (firstPush === null) firstPush = block.line;
    if (kinds.includes('win')) pushesWin = true;

    const allowed = kinds.map((k) => CONTAINER[k]);
    const parents = [...block.text.matchAll(/parentNodeId:\s*"?([^"\s,]+)"?/g)].map((m) => m[1]);
    if (!parents.length || parents.some((p) => !allowed.includes(p))) {
      add(block.line, 'no-calendar-push',
        `${kinds.join(' and ')} pushes must use parentNodeId: ${allowed.map((c) => `"${c}"`).join(' or ')}, never a calendar node or a literal ID`);
    }
    for (const kind of kinds) {
      const map = kind === 'win' ? 'entities.wins.tana_node_ids' : 'entities.decisions.tana_node_ids';
      if (!text.includes(map)) {
        add(block.line, 'missing-dedup-record',
          `this file pushes a ${kind} to Tana but never mentions ${map}; record every push so /sync does not duplicate it`);
      }
      if (!text.includes('tana_node_overrides')) {
        add(block.line, 'missing-override',
          `this file pushes a ${kind} to Tana but never resolves tana_node_overrides`);
      }
    }
    if (kinds.includes('win')) {
      if (!/PERIODICITY_FIELD_ID/.test(block.text)) {
        add(block.line, 'win-without-periodicity', 'win pushes must set Periodicity (Week by default, never Day)');
      }
      if (/::\s*Day\b/.test(block.text)) {
        add(block.line, 'win-day-periodicity', 'Day-scoped wins are invisible in weekly reviews; use Week or higher');
      }
    }
  }

  if (firstPush !== null && !/\bempty\b[\s\S]{0,240}\bunrecorded\b/i.test(text)) {
    add(firstPush, 'missing-empty-id-guard',
      'a writer must say what happens when a resolved container, tag or field ID is empty: skip the push and leave it unrecorded, never improvise a target');
  }
  if (pushesWin && /\bcreate (?:it|the\b[^.\n]{0,40}\bmap)\b/i.test(text) && !text.includes('pre-map')) {
    add(firstPush, 'missing-cursor-seed',
      'creating the wins map on a state file with a last_pushed_win_id cursor must seed earlier wins as pre-map, or /sync re-pushes the whole history');
  }
  return out;
}

function lintSyncState(file, text) {
  const section = text.match(/\n {2}wins:\n([\s\S]*?)(?=\n {2}[a-z_]+:\n|\s*$)/);
  if (!section || !/^\s+tana_node_ids:/m.test(section[1])) {
    return [{
      file, line: 1, rule: 'state-schema',
      message: 'entities.wins must declare tana_node_ids: {} — the dedup map shared by /win, /build, /sync and the tana agent',
    }];
  }
  return [];
}

function skillFiles(root) {
  const files = [];
  const claudeMd = path.join(root, 'CLAUDE.md');
  if (fs.existsSync(claudeMd)) files.push(claudeMd);
  const commands = path.join(root, '.claude', 'commands');
  if (fs.existsSync(commands)) {
    for (const dir of fs.readdirSync(commands)) {
      const f = path.join(commands, dir, 'SKILL.md');
      if (fs.existsSync(f)) files.push(f);
    }
  }
  const agents = path.join(root, '.claude', 'agents');
  if (fs.existsSync(agents)) {
    for (const f of fs.readdirSync(agents)) {
      if (f.endsWith('.md')) files.push(path.join(agents, f));
    }
  }
  return files;
}

function lintRepo(root) {
  const out = [];
  for (const f of skillFiles(root)) {
    out.push(...lintText(path.relative(root, f).split(path.sep).join('/'), fs.readFileSync(f, 'utf8')));
  }
  const state = path.join(root, 'SYSTEM', 'sync-state.yaml');
  if (fs.existsSync(state)) {
    out.push(...lintSyncState('SYSTEM/sync-state.yaml', fs.readFileSync(state, 'utf8')));
  }
  return out;
}

module.exports = { fencedBlocks, lintText, lintSyncState, lintRepo };

if (require.main === module) {
  const root = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
  const violations = lintRepo(root);
  for (const v of violations) console.log(`${v.file}:${v.line} [${v.rule}] ${v.message}`);
  console.log(violations.length ? `\n${violations.length} violation(s)` : 'skill-lint: clean');
  process.exit(violations.length ? 1 : 0);
}
