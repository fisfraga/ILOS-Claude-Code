#!/usr/bin/env node
'use strict';
// Static guard for the Tana write contract in skills and agent files.
//
//   node SYSTEM/tools/skill-lint.js [templateRoot]     (exits 1 on violations)
//
// The contract: wins and decisions are pushed to the resolved wins/decisions container
// (never to today's calendar node), every push is recorded in sync-state.yaml so /sync
// can dedup, container IDs honour tana_node_overrides, and wins always set Periodicity.

const fs = require('fs');
const path = require('path');

const FENCE = /^\s*```/;
const WIN_TAG = /\bWIN_TAG_ID\b/;
const DECISION_TAG = /\bDECISION_TAG_ID\b/;

function fencedBlocks(text) {
  const blocks = [];
  let open = null;
  text.split('\n').forEach((line, i) => {
    if (FENCE.test(line)) {
      if (open === null) {
        open = { line: i + 1, lines: [] };
      } else {
        blocks.push({ line: open.line, text: open.lines.join('\n') });
        open = null;
      }
    } else if (open !== null) {
      open.lines.push(line);
    }
  });
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
  });

  for (const block of fencedBlocks(text)) {
    const pushes = /import_tana_paste/.test(block.text);
    const isWin = pushes && WIN_TAG.test(block.text);
    const isDecision = pushes && DECISION_TAG.test(block.text);
    if (!isWin && !isDecision) continue;

    const kind = isWin ? 'win' : 'decision';
    const map = isWin ? 'entities.wins.tana_node_ids' : 'entities.decisions.tana_node_ids';

    if (/parentNodeId:\s*TODAY_NODE_ID/.test(block.text)) {
      add(block.line, 'no-calendar-push',
        `${kind}s must be pushed to the resolved ${kind}s container, never to today's calendar node`);
    }
    if (!text.includes(map)) {
      add(block.line, 'missing-dedup-record',
        `this file pushes a ${kind} to Tana but never mentions ${map}; record every push so /sync does not duplicate it`);
    }
    if (!text.includes('tana_node_overrides')) {
      add(block.line, 'missing-override',
        `this file pushes a ${kind} to Tana but never resolves tana_node_overrides`);
    }
    if (isWin && !/PERIODICITY_FIELD_ID/.test(block.text)) {
      add(block.line, 'win-without-periodicity', 'win pushes must set Periodicity (Week by default, never Day)');
    }
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
