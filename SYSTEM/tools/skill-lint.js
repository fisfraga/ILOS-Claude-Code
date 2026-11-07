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
// legacy last_pushed_win_id cursor. Since 1.1 the push templates live only in
// SYSTEM/tana-write-contract.md: every writer a recipe lists must cite it, and no other file may
// restate a push template for an entity the contract has a recipe for.

const fs = require('fs');
const path = require('path');

const FENCE = /^\s*(```|~~~)/;
const WIN_TAG = /\bWIN_TAG_ID\b|#win\b/;
const DECISION_TAG = /\bDECISION_TAG_ID\b|#decision\b/;
const ID_PLACEHOLDER = /\[((?:[A-Z][A-Z0-9_]*_ID(?:_RESOLVED)?)(?:\s*\|\s*[A-Z][A-Z0-9_]*_ID(?:_RESOLVED)?)*)\]/g;
const RETIRED_IDS = {
  ACTIVE_OPTION_ID: 'GOAL_ACTIVE_OPTION_ID (goal status) or PROJECT_ACTIVE_OPTION_ID (project status)',
  COMPLETED_OPTION_ID: 'GOAL_COMPLETED_OPTION_ID or PROJECT_COMPLETED_OPTION_ID',
  BACKLOG_OPTION_ID: 'GOAL_BACKLOG_OPTION_ID or PROJECT_BACKLOG_OPTION_ID',
  OPEN_OPTION_ID: 'DECISION_OPEN_OPTION_ID',
  DECIDED_OPTION_ID: 'DECISION_DECIDED_OPTION_ID',
  SET_ASIDE_OPTION_ID: 'DECISION_SET_ASIDE_OPTION_ID',
  YEAR_OPTION_ID: 'PERIODICITY_YEAR_OPTION_ID',
  WEEKLY_OPTION_ID: 'PERIODICITY_WEEK_OPTION_ID',
  MONTHLY_OPTION_ID: 'PERIODICITY_MONTH_OPTION_ID',
  DAILY_OPTION_ID: 'PERIODICITY_DAY_OPTION_ID',
  FP_TAG_ID: 'FAVORITE_PROBLEM_TAG_ID',
};

function isRuntimeId(name) {
  return /_NODE_ID$/.test(name) || name === 'GOAL_ID';
}

function idKeys(yamlText) {
  const keys = new Set();
  for (const m of yamlText.matchAll(/^\s+([A-Z][A-Z0-9_]*_ID):/gm)) keys.add(m[1]);
  return keys;
}

const CONTRACT_PATH = 'SYSTEM/tana-write-contract.md';
// Entities the write contract can own. An entity is protected (its push template may live only
// in the contract) once the contract has a "## Recipe: `<entity>`" section for it.
const ENTITY_TAGS = {
  win: WIN_TAG,
  decision: DECISION_TAG,
  goal: /\b(?:ANNUAL|QUARTERLY|MONTHLY|WEEKLY|DAILY)_GOAL_TAG_ID\b/,
  project: /\bPROJECT_TAG_ID\b/,
  topic: /\bTOPIC_TAG_ID\b/,
};
const CONTRACT_REF = /contract for `([a-z_]+)`/g;

// "## Recipe: `win`" followed, before the next "## ", by "**Writers:** `path`, `path`".
function parseContract(text) {
  const out = {};
  let entity = null;
  for (const line of text.split('\n')) {
    const heading = line.match(/^##\s+Recipe:\s+`([a-z_]+)`/);
    if (heading) { entity = heading[1]; out[entity] = []; continue; }
    if (/^##\s/.test(line)) { entity = null; continue; }
    if (entity && /^\*\*Writers:\*\*/.test(line)) {
      out[entity] = [...line.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
    }
  }
  return out;
}

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

function lintText(file, text, opts = {}) {
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
    if (opts.contract) {
      for (const m of line.matchAll(CONTRACT_REF)) {
        const writers = opts.contract[m[1]];
        if (!writers) {
          add(i + 1, 'unlisted-contract-ref', `the write contract has no recipe for \`${m[1]}\``);
        } else if (!opts.isContract && !writers.includes(file)) {
          add(i + 1, 'unlisted-contract-ref', `${file} follows the contract for \`${m[1]}\` but is not in that recipe's Writers list`);
        }
      }
    }
    if (/\btana_workspace_id\b/.test(line) && !/legacy/i.test(line)) {
      add(i + 1, 'workspace-id-source',
        'the workspace ID lives in SYSTEM/tana-ids.yaml (WORKSPACE_ID); read sync-config.yaml\'s tana_workspace_id only as the legacy fallback, and say so');
    }
    const server = line.match(/\bmcp__tana[\w-]*/);
    if (server) {
      add(i + 1, 'hardcoded-mcp-server',
        `${server[0]} names one MCP server; buyers name theirs differently (see SYSTEM/tana-mcp-setup.md) — say "Tana MCP" and call tools by their bare name`);
    }
  });

  if (opts.knownIds) {
    text.split('\n').forEach((line, i) => {
      for (const m of line.matchAll(ID_PLACEHOLDER)) {
        for (const raw of m[1].split('|')) {
          const shown = raw.trim();
          const name = shown.replace(/_RESOLVED$/, '');
          if (isRuntimeId(name) || opts.knownIds.has(name)) continue;
          const hint = RETIRED_IDS[name] ? ` — renamed: use ${RETIRED_IDS[name]}` : '';
          add(i + 1, 'undefined-id-key', `[${shown}] has no key in SYSTEM/tana-ids.yaml${hint}`);
        }
      }
      if (/tana-reference\/(?:tag-ids|field-ids|structure-map)/.test(line)) {
        add(i + 1, 'stale-reference-table',
          'SYSTEM/tana-reference tag-ids/field-ids/structure-map are superseded by SYSTEM/tana-ids.yaml');
      }
    });
  }

  let firstPush = null;
  let pushesWin = false;
  for (const block of fencedBlocks(text)) {
    if (/"id":\s*"win_/.test(block.text)) {
      for (const key of ['description', 'scale', 'emotional_weight', 'connected_goal', 'tags']) {
        if (!block.text.includes(`"${key}"`)) {
          add(block.line, 'win-record-schema',
            `win record is missing "${key}" (canonical: id, date, description, area, scale, emotional_weight, connected_goal, tags)`);
        }
      }
      for (const key of ['title', 'source']) {
        if (block.text.includes(`"${key}"`)) {
          add(block.line, 'win-record-schema', `win record must not use "${key}"; put the origin in "tags" and the text in "description"`);
        }
      }
    }
    if (block.unclosed) add(block.line, 'unclosed-fence', 'fenced block is never closed; the lint cannot tell where it ends');
    const pushes = /import_tana_paste/.test(block.text);
    if (pushes && opts.contract && !opts.isContract) {
      for (const entity of Object.keys(opts.contract)) {
        if (ENTITY_TAGS[entity] && ENTITY_TAGS[entity].test(block.text)) {
          add(block.line, 'restated-push-template',
            `${entity} pushes are written once, in ${CONTRACT_PATH}; say "follow the contract for \`${entity}\`" instead of restating the template`);
        }
      }
    }
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
      if (opts.knownIds && !text.includes('tana-ids.yaml')) {
        add(block.line, 'missing-ids-source', `this file pushes a ${kind} to Tana but never reads SYSTEM/tana-ids.yaml`);
      }
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
  for (const rel of ['AGENTS.md', 'CLAUDE.md']) {
    const f = path.join(root, rel);
    if (fs.existsSync(f)) files.push(f);
  }
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
  for (const rel of [path.join('ILOS-KNOWLEDGE', 'schemas.md')]) {
    const f = path.join(root, rel);
    if (fs.existsSync(f) && !files.includes(f)) files.push(f);
  }
  return files;
}

function lintRepo(root) {
  const out = [];
  const idsFile = path.join(root, 'SYSTEM', 'tana-ids.yaml');
  const knownIds = fs.existsSync(idsFile) ? idKeys(fs.readFileSync(idsFile, 'utf8')) : null;
  const contractFile = path.join(root, CONTRACT_PATH);
  const contract = fs.existsSync(contractFile) ? parseContract(fs.readFileSync(contractFile, 'utf8')) : null;
  const files = skillFiles(root);
  if (contract) files.push(contractFile);
  for (const f of files) {
    const rel = path.relative(root, f).split(path.sep).join('/');
    out.push(...lintText(rel, fs.readFileSync(f, 'utf8'), { knownIds, contract, isContract: rel === CONTRACT_PATH }));
  }
  if (contract) {
    for (const [entity, writers] of Object.entries(contract)) {
      for (const rel of writers) {
        const f = path.join(root, rel);
        if (!fs.existsSync(f)) {
          out.push({ file: CONTRACT_PATH, line: 1, rule: 'missing-writer-file', message: `${rel} is listed as a ${entity} writer but does not exist` });
          continue;
        }
        const text = fs.readFileSync(f, 'utf8');
        if (!text.includes('tana-write-contract.md') || !text.includes(`contract for \`${entity}\``)) {
          out.push({ file: rel, line: 1, rule: 'writer-missing-contract-ref',
            message: `listed as a ${entity} writer: say "Read SYSTEM/tana-write-contract.md and follow the contract for \`${entity}\`"` });
        }
      }
    }
  }
  const state = path.join(root, 'SYSTEM', 'sync-state.yaml');
  if (fs.existsSync(state)) {
    out.push(...lintSyncState('SYSTEM/sync-state.yaml', fs.readFileSync(state, 'utf8')));
  }
  return out;
}

module.exports = { fencedBlocks, lintText, lintSyncState, lintRepo, idKeys, parseContract, CONTRACT_PATH, ENTITY_TAGS };

if (require.main === module) {
  const root = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
  const violations = lintRepo(root);
  for (const v of violations) console.log(`${v.file}:${v.line} [${v.rule}] ${v.message}`);
  console.log(violations.length ? `\n${violations.length} violation(s)` : 'skill-lint: clean');
  process.exit(violations.length ? 1 : 0);
}
