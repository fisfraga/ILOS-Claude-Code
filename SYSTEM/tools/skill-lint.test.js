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
const GUARD = 'If a resolved container, tag or field ID is empty, skip the push and leave it unrecorded.';
const GOOD_WIN_FILE =
  'Resolve tana_node_overrides first. Record entities.wins.tana_node_ids after each push. ' + GUARD + '\n' + WIN_PUSH;

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
  const both = 'tana_node_overrides entities.decisions.tana_node_ids ' + GUARD + '\n' + decisionPush;
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
  const text = 'tana_node_overrides entities.wins.tana_node_ids ' + GUARD + '\n' + noPeriodicity;
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

// ---- review hardening (final review, issues 1, 2, 4, 6) ----

const pushTo = (parent, tag, tail = '') => fence(
  `import_tana_paste({\n  parentNodeId: ${parent},\n  content: "- x #[[^[${tag}]]]${tail}"\n})`
);
const WEEK = '\\n  - [[^[PERIODICITY_FIELD_ID]]]:: Week';
const MAPS = 'tana_node_overrides entities.wins.tana_node_ids entities.decisions.tana_node_ids ' + GUARD + '\n';

test('a win or decision may only be pushed to its own resolved container', () => {
  for (const parent of ['"[TODAY_NODE_ID]"', '"[DAY_OR_WEEK_NODE_ID]"', '"[DECISIONS_CONTAINER_ID_RESOLVED]"', '"abc123"']) {
    const text = MAPS + pushTo(parent, 'WIN_TAG_ID', WEEK);
    assert.ok(rules(lintText('w.md', text)).includes('no-calendar-push'), parent);
  }
  const noParent = MAPS + fence('import_tana_paste({\n  content: "- x #[[^[WIN_TAG_ID]]]' + WEEK + '"\n})');
  assert.ok(rules(lintText('w.md', noParent)).includes('no-calendar-push'));
  const ok = MAPS + pushTo('"[WINS_CONTAINER_ID_RESOLVED]"', 'WIN_TAG_ID', WEEK);
  assert.deepStrictEqual(lintText('w.md', ok), []);
});

test('a win pushed with Periodicity Day is flagged', () => {
  const text = MAPS + pushTo('"[WINS_CONTAINER_ID_RESOLVED]"', 'WIN_TAG_ID', '\\n  - [[^[PERIODICITY_FIELD_ID]]]:: Day');
  assert.deepStrictEqual(rules(lintText('w.md', text)), ['win-day-periodicity']);
});

test('a push inside a tilde fence is still checked', () => {
  const body = 'import_tana_paste({\n  parentNodeId: TODAY_NODE_ID,\n  content: "- x #[[^[WIN_TAG_ID]]]' + WEEK + '"\n})';
  const text = MAPS + '~~~\n' + body + '\n~~~';
  assert.ok(rules(lintText('w.md', text)).includes('no-calendar-push'));
});

test('an unclosed fence is reported and its content is still checked', () => {
  const body = 'import_tana_paste({\n  parentNodeId: TODAY_NODE_ID,\n  content: "- x #[[^[WIN_TAG_ID]]]' + WEEK + '"\n})';
  const text = MAPS + F + '\n' + body;
  const r = rules(lintText('w.md', text));
  assert.ok(r.includes('unclosed-fence'));
  assert.ok(r.includes('no-calendar-push'));
});

test('a block that pushes both a win and a decision is checked as both', () => {
  const both = fence(
    'import_tana_paste({\n  parentNodeId: "[WINS_CONTAINER_ID_RESOLVED]",\n' +
    '  content: "- w #[[^[WIN_TAG_ID]]]' + WEEK + '\\n- d #[[^[DECISION_TAG_ID]]]"\n})'
  );
  const winsMapOnly = 'tana_node_overrides entities.wins.tana_node_ids ' + GUARD + '\n' + both;
  assert.deepStrictEqual(rules(lintText('b.md', winsMapOnly)), ['missing-dedup-record']);
});

test('a literal #win tag without the placeholder is still a win push', () => {
  const text = MAPS + fence('import_tana_paste({\n  parentNodeId: "[WINS_CONTAINER_ID_RESOLVED]",\n  content: "- x #win"\n})');
  assert.deepStrictEqual(rules(lintText('w.md', text)), ['win-without-periodicity']);
});

test('a skill that pushes by the last_pushed cursor is flagged', () => {
  const bad = 'Push wins after `last_pushed_win_id` in sync-state.yaml to Tana.';
  assert.deepStrictEqual(rules(lintText('r.md', bad)), ['cursor-push']);
  const fine = 'Set `entities.wins.last_pushed_win_id` to the win you just pushed. Never select wins by `last_pushed_win_id`.';
  assert.deepStrictEqual(lintText('r.md', fine), []);
});

test('a writer without the empty-ID guard is flagged', () => {
  const text = 'tana_node_overrides entities.wins.tana_node_ids\n' + WIN_PUSH;
  assert.deepStrictEqual(rules(lintText('w.md', text)), ['missing-empty-id-guard']);
});

test('creating the wins map must seed it from a legacy cursor (pre-map)', () => {
  const create = GOOD_WIN_FILE + '\nIf the state file has no map, create the map first.';
  assert.deepStrictEqual(rules(lintText('w.md', create)), ['missing-cursor-seed']);
  assert.deepStrictEqual(lintText('w.md', create + ' Seed it with pre-map entries when last_pushed_win_id is set.'), []);
});

test('lintRepo also scans the root CLAUDE.md', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ilos-lint-'));
  fs.writeFileSync(path.join(root, 'CLAUDE.md'), 'parentNodeId: "[WINS_CONTAINER_ID]"\n');
  assert.deepStrictEqual(lintRepo(root).map((v) => v.file), ['CLAUDE.md']);
});

test('the template itself is lint-clean (node --test is the single gate)', () => {
  assert.deepStrictEqual(lintRepo(path.resolve(__dirname, '..', '..')), []);
});
