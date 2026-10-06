'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { lintText, lintSyncState, lintRepo } = require('./skill-lint');

const F = '```';
const fence = (body) => `${F}\n${body}\n${F}`;
const rules = (vs) => vs.map((v) => v.rule).sort();

const WIN_PUSH = fence(
  'import_tana_paste({\n' +
  '  parentNodeId: "[WINS_CONTAINER_ID_RESOLVED]",\n' +
  '  content: "- x #[[^[WIN_TAG_ID]]]\\n  - [[^[PERIODICITY_FIELD_ID]]]:: Week"\n' +
  '})'
);
const GOOD_WIN_FILE =
  'Resolve tana_node_overrides first. Record entities.wins.tana_node_ids after each push.\n' + WIN_PUSH;

test('a compliant win push produces no violations', () => {
  assert.deepStrictEqual(lintText('good.md', GOOD_WIN_FILE), []);
});

test('pushing a win to today\'s calendar node is flagged', () => {
  const bad = GOOD_WIN_FILE.replace('"[WINS_CONTAINER_ID_RESOLVED]"', 'TODAY_NODE_ID');
  assert.ok(rules(lintText('bad.md', bad)).includes('no-calendar-push'));
});

test('a daily goal on today\'s calendar node is allowed', () => {
  const daily = fence(
    'import_tana_paste({\n  parentNodeId: TODAY_NODE_ID,\n  content: "- [ ] g #[[^[DAILY_GOAL_TAG_ID]]]"\n})'
  );
  assert.deepStrictEqual(lintText('morning.md', daily), []);
});

test('unresolved container placeholders are flagged, resolved ones are not', () => {
  const bad = lintText('s.md', 'parentNodeId: "[GOALS_CONTAINER_ID]",');
  assert.deepStrictEqual(rules(bad), ['unresolved-container']);
  assert.strictEqual(bad[0].line, 1);
  assert.deepStrictEqual(lintText('s.md', 'parentNodeId: "[GOALS_CONTAINER_ID_RESOLVED]",'), []);
});

test('a win push without a mention of the wins dedup map is flagged', () => {
  const text = 'Resolve tana_node_overrides first.\n' + WIN_PUSH;
  assert.ok(rules(lintText('w.md', text)).includes('missing-dedup-record'));
});

test('a decision push needs the decisions map, not the wins map', () => {
  const decisionPush = fence(
    'import_tana_paste({\n  parentNodeId: "[DECISIONS_CONTAINER_ID_RESOLVED]",\n' +
    '  content: "- d #[[^[DECISION_TAG_ID]]]"\n})'
  );
  const winsMapOnly = 'tana_node_overrides entities.wins.tana_node_ids\n' + decisionPush;
  assert.ok(rules(lintText('d.md', winsMapOnly)).includes('missing-dedup-record'));
  const both = 'tana_node_overrides entities.decisions.tana_node_ids\n' + decisionPush;
  assert.deepStrictEqual(lintText('d.md', both), []);
});

test('a win or decision push that never resolves tana_node_overrides is flagged', () => {
  const text = 'Record entities.wins.tana_node_ids.\n' + WIN_PUSH;
  assert.ok(rules(lintText('w.md', text)).includes('missing-override'));
});

test('a win push without Periodicity is flagged', () => {
  const noPeriodicity = fence(
    'import_tana_paste({\n  parentNodeId: "[WINS_CONTAINER_ID_RESOLVED]",\n  content: "- x #[[^[WIN_TAG_ID]]]"\n})'
  );
  const text = 'tana_node_overrides entities.wins.tana_node_ids\n' + noPeriodicity;
  assert.deepStrictEqual(rules(lintText('w.md', text)), ['win-without-periodicity']);
});

test('sync-state must declare entities.wins.tana_node_ids', () => {
  const good = 'entities:\n\n  wins:\n    last_push: null\n    tana_node_ids: {}\n\n  decisions:\n    tana_node_ids: {}\n';
  const bad = 'entities:\n\n  wins:\n    last_push: null\n    last_pushed_win_id: null\n\n  decisions:\n    tana_node_ids: {}\n';
  assert.deepStrictEqual(lintSyncState('state.yaml', good), []);
  assert.deepStrictEqual(rules(lintSyncState('state.yaml', bad)), ['state-schema']);
});

test('lintRepo scans skills, agents and the sync state with relative paths', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ilos-lint-'));
  fs.mkdirSync(path.join(root, '.claude', 'commands', 'x'), { recursive: true });
  fs.mkdirSync(path.join(root, '.claude', 'agents'), { recursive: true });
  fs.mkdirSync(path.join(root, 'SYSTEM'), { recursive: true });
  fs.writeFileSync(path.join(root, '.claude', 'commands', 'x', 'SKILL.md'), 'parentNodeId: "[WINS_CONTAINER_ID]"\n');
  fs.writeFileSync(path.join(root, '.claude', 'agents', 'a.md'), 'parentNodeId: "[GOALS_CONTAINER_ID]"\n');
  fs.writeFileSync(path.join(root, 'SYSTEM', 'sync-state.yaml'), 'entities:\n\n  wins:\n    last_push: null\n');
  const files = lintRepo(root).map((v) => v.file).sort();
  assert.deepStrictEqual(files, [
    '.claude/agents/a.md',
    '.claude/commands/x/SKILL.md',
    'SYSTEM/sync-state.yaml',
  ]);
});
