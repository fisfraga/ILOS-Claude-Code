'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { lintText, lintSyncState, lintRepo, idKeys, parseContract, CONTRACT_PATH } = require('./skill-lint');

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

test('lintRepo also scans the root AGENTS.md', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ilos-lint-'));
  fs.writeFileSync(path.join(root, 'AGENTS.md'), 'parentNodeId: "[WINS_CONTAINER_ID]"\n');
  assert.deepStrictEqual(lintRepo(root).map((v) => v.file), ['AGENTS.md']);
});

test('the template itself is lint-clean (node --test is the single gate)', () => {
  assert.deepStrictEqual(lintRepo(path.resolve(__dirname, '..', '..')), []);
});

// ---- Phase 1b-1: one canonical win record ----

const GOOD_RECORD =
  '{"id": "win_20260101_090000", "date": "2026-01-01", "description": "x", "area": "career", "scale": "week", "emotional_weight": 5, "connected_goal": null, "tags": ["manual"]}';

test('a canonical win record produces no violations', () => {
  assert.deepStrictEqual(lintText('win.md', fence(GOOD_RECORD)), []);
});

test('a win record using title and source is flagged', () => {
  const old = '{"id": "win_20260101_090000", "date": "2026-01-01", "title": "x", "area": "career", "connected_goal": null, "source": "manual"}';
  const vs = lintText('win.md', fence(old));
  assert.ok(vs.every((v) => v.rule === 'win-record-schema'));
  const msgs = vs.map((v) => v.message).join(' | ');
  assert.ok(msgs.includes('"description"'));
  assert.ok(msgs.includes('"scale"'));
  assert.ok(msgs.includes('"title"'));
  assert.ok(msgs.includes('"source"'));
});

test('text outside a win record block is not checked by the win-record rule', () => {
  assert.deepStrictEqual(lintText('x.md', fence('{"id": "dec_20260101_090000", "decision": "x"}')), []);
});

// ---- Phase 1b-1: tana-ids.yaml keys ----

const KNOWN = new Set(['WIN_TAG_ID', 'PERIODICITY_FIELD_ID', 'GOAL_ACTIVE_OPTION_ID', 'GOAL_STATUS_FIELD_ID', 'WINS_CONTAINER_ID', 'DECISION_TAG_ID']);

test('idKeys reads the UPPER_SNAKE_ID keys of the ids file', () => {
  const keys = idKeys('workspace:\n  WORKSPACE_ID: ""\ntags:\n  WIN_TAG_ID: "abc"\nareas:\n  health: ""\ncapabilities:\n  decision_supertag: unknown\n');
  assert.deepStrictEqual([...keys].sort(), ['WIN_TAG_ID', 'WORKSPACE_ID']);
});

test('a placeholder with no key in the ids file is flagged with its line', () => {
  const vs = lintText('s.md', 'ok [WIN_TAG_ID]\nbad [MYSTERY_FIELD_ID]\n', { knownIds: KNOWN });
  assert.deepStrictEqual(rules(vs), ['undefined-id-key']);
  assert.strictEqual(vs[0].line, 2);
});

test('known keys, resolved containers and runtime node IDs are accepted', () => {
  const text = '[WIN_TAG_ID] [WINS_CONTAINER_ID_RESOLVED] [TANA_GOAL_NODE_ID] [AREA_NODE_ID] [GOAL_ID]\n';
  assert.deepStrictEqual(lintText('s.md', text, { knownIds: KNOWN }), []);
});

test('a retired name is flagged with the name to use instead', () => {
  const vs = lintText('s.md', '"[ACTIVE_OPTION_ID]"\n', { knownIds: KNOWN });
  assert.deepStrictEqual(rules(vs), ['undefined-id-key']);
  assert.ok(vs[0].message.includes('GOAL_ACTIVE_OPTION_ID'));
});

test('a pipe list of placeholders is checked item by item', () => {
  const vs = lintText('s.md', '"[GOAL_ACTIVE_OPTION_ID | BOGUS_OPTION_ID]"\n', { knownIds: KNOWN });
  assert.deepStrictEqual(rules(vs), ['undefined-id-key']);
  assert.ok(vs[0].message.includes('BOGUS_OPTION_ID'));
});

test('references to the retired reference tables are flagged once the ids file exists', () => {
  const text = 'Read `SYSTEM/tana-reference/tag-ids.md`.\n';
  assert.deepStrictEqual(rules(lintText('s.md', text, { knownIds: KNOWN })), ['stale-reference-table']);
  assert.deepStrictEqual(lintText('s.md', text), []);
});

test('a win or decision push must read tana-ids.yaml', () => {
  const push = fence('import_tana_paste({\n  parentNodeId: "[WINS_CONTAINER_ID_RESOLVED]",\n  content: "- x #[[^[WIN_TAG_ID]]]\\n  - [[^[PERIODICITY_FIELD_ID]]]:: Week"\n})');
  const base = 'tana_node_overrides entities.wins.tana_node_ids ' + GUARD + '\n' + push;
  assert.ok(rules(lintText('w.md', base, { knownIds: KNOWN })).includes('missing-ids-source'));
  assert.deepStrictEqual(lintText('w.md', 'Read SYSTEM/tana-ids.yaml. ' + base, { knownIds: KNOWN }), []);
});

test('lintRepo uses SYSTEM/tana-ids.yaml when it exists', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ilos-lint-ids-'));
  fs.mkdirSync(path.join(root, '.claude', 'commands', 'x'), { recursive: true });
  fs.mkdirSync(path.join(root, 'SYSTEM'), { recursive: true });
  fs.writeFileSync(path.join(root, '.claude', 'commands', 'x', 'SKILL.md'), '[NOT_A_KEY_ID]\n');
  assert.deepStrictEqual(lintRepo(root), []);
  fs.writeFileSync(path.join(root, 'SYSTEM', 'tana-ids.yaml'), 'tags:\n  WIN_TAG_ID: ""\n');
  assert.deepStrictEqual(rules(lintRepo(root)), ['undefined-id-key']);
});

test('a skill naming an MCP server or tool prefix is flagged', () => {
  assert.ok(rules(lintText('s.md', 'configured in Claude Code settings (mcp__tana-local).')).includes('hardcoded-mcp-server'));
  assert.ok(rules(lintText('s.md', 'call mcp__tana__list_workspaces')).includes('hardcoded-mcp-server'));
  assert.deepStrictEqual(lintText('s.md', 'Check that your Tana MCP server is connected.'), []);
});

// ---- 1.1: one Tana write contract ----

const CONTRACT = '## Recipe: `win`\n**Writers:** `.claude/commands/win/SKILL.md`, `.claude/agents/tana.md`\n\n## Recipe: `decision`\n**Writers:** `.claude/commands/decision/SKILL.md`\n';

test('parseContract maps each recipe to its writers', () => {
  assert.deepStrictEqual(parseContract(CONTRACT), {
    win: ['.claude/commands/win/SKILL.md', '.claude/agents/tana.md'],
    decision: ['.claude/commands/decision/SKILL.md'],
  });
});

test('a push template for a contract entity outside the contract is flagged', () => {
  const vs = lintText('.claude/commands/win/SKILL.md', GOOD_WIN_FILE, { contract: parseContract(CONTRACT) });
  assert.ok(rules(vs).includes('restated-push-template'));
});

test('the same push template inside the contract is allowed', () => {
  const vs = lintText(CONTRACT_PATH, GOOD_WIN_FILE, { contract: parseContract(CONTRACT), isContract: true });
  assert.ok(!rules(vs).includes('restated-push-template'));
});

test('an entity with no recipe yet is not protected', () => {
  const goal = fence('import_tana_paste({\n  parentNodeId: NEXT_WEEK_NODE_ID,\n  content: "- [ ] g #[[^[WEEKLY_GOAL_TAG_ID]]]"\n})');
  assert.deepStrictEqual(lintText('weekly.md', goal, { contract: parseContract(CONTRACT) }), []);
});

test('a goal push template is protected once the goal recipe exists', () => {
  const goal = fence('import_tana_paste({\n  parentNodeId: NEXT_WEEK_NODE_ID,\n  content: "- [ ] g #[[^[WEEKLY_GOAL_TAG_ID]]]"\n})');
  const c = parseContract(CONTRACT + '\n## Recipe: `goal`\n**Writers:** `weekly.md`\n');
  assert.ok(rules(lintText('weekly.md', goal, { contract: c })).includes('restated-push-template'));
});

test('citing a contract entity that has no recipe, or from an unlisted file, is flagged', () => {
  const c = { contract: parseContract(CONTRACT) };
  assert.ok(rules(lintText('.claude/commands/win/SKILL.md', 'follow the contract for `topic` in SYSTEM/tana-write-contract.md', c)).includes('unlisted-contract-ref'));
  assert.ok(rules(lintText('.claude/commands/sync/SKILL.md', 'follow the contract for `win` in SYSTEM/tana-write-contract.md', c)).includes('unlisted-contract-ref'));
  assert.deepStrictEqual(lintText('.claude/commands/win/SKILL.md', 'Read SYSTEM/tana-write-contract.md and follow the contract for `win`.', c), []);
});

function contractRepo(contract, files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ilos-lint-contract-'));
  fs.mkdirSync(path.join(root, 'SYSTEM'), { recursive: true });
  fs.writeFileSync(path.join(root, CONTRACT_PATH), contract);
  for (const [rel, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), text);
  }
  return root;
}

const CITES_WIN = 'Read SYSTEM/tana-write-contract.md and follow the contract for `win`.\n';
const ONE_WRITER = '## Recipe: `win`\n**Writers:** `.claude/commands/win/SKILL.md`\n';

test('a listed writer that does not cite the contract is flagged', () => {
  const root = contractRepo(ONE_WRITER, { '.claude/commands/win/SKILL.md': 'Push the win.\n' });
  assert.ok(rules(lintRepo(root)).includes('writer-missing-contract-ref'));
});

test('a listed writer that cites the contract is clean', () => {
  const root = contractRepo(ONE_WRITER, { '.claude/commands/win/SKILL.md': CITES_WIN });
  assert.deepStrictEqual(lintRepo(root), []);
});

test('a listed writer path that does not exist is flagged', () => {
  const root = contractRepo(ONE_WRITER, {});
  assert.ok(rules(lintRepo(root)).includes('missing-writer-file'));
});

test('the contract itself is linted by the push rules', () => {
  const noPeriodicity = GOOD_WIN_FILE.replace('\\n  - [[^[PERIODICITY_FIELD_ID]]]:: Week', '');
  const root = contractRepo(ONE_WRITER + noPeriodicity, { '.claude/commands/win/SKILL.md': CITES_WIN });
  const vs = lintRepo(root);
  assert.ok(vs.some((v) => v.file === CONTRACT_PATH && v.rule === 'win-without-periodicity'));
  assert.ok(!rules(vs).includes('restated-push-template'));
});

test('reading tana_workspace_id is only allowed as the legacy fallback', () => {
  assert.ok(rules(lintText('s.md', 'If `tana_workspace_id` is empty, stop.')).includes('workspace-id-source'));
  assert.deepStrictEqual(lintText('s.md', 'Legacy fallback: a 1.0 sync-config.yaml may still hold `tana_workspace_id`.'), []);
});

// ---- 1.1 review fixes ----

const FULL_CONTRACT = CONTRACT + '\n## Recipe: `goal`\n**Writers:** `weekly.md`\n';

test('a push template using named tags or a raw Tana Paste block is still a restated template', () => {
  const c = parseContract(FULL_CONTRACT);
  const named = fence('import_tana_paste({\n  parentNodeId: "[WINS_CONTAINER_ID_RESOLVED]",\n  content: "- x #[[win]]"\n})');
  assert.ok(rules(lintText('s.md', named, { contract: c })).includes('restated-push-template'));
  const paste = fence('%%tana%%\n- x #[[^[WIN_TAG_ID]]]\n  - [[^[PERIODICITY_FIELD_ID]]]:: Week');
  assert.ok(rules(lintText('s.md', paste, { contract: c })).includes('restated-push-template'));
  const goal = fence('import_tana_paste({\n  parentNodeId: NEXT_WEEK_NODE_ID,\n  content: "- [ ] g #[[weekly goal]]"\n})');
  assert.ok(rules(lintText('weekly.md', goal, { contract: c })).includes('restated-push-template'));
});

test('connector-style and bare server names are flagged', () => {
  assert.ok(rules(lintText('s.md', 'call mcp__claude_ai_Tana__list_workspaces')).includes('hardcoded-mcp-server'));
  assert.ok(rules(lintText('s.md', 'use the tana-outliner-local server')).includes('hardcoded-mcp-server'));
  assert.deepStrictEqual(lintText('s.md', 'Your Tana server can be local or remote.'), []);
});

test('"not legacy" does not excuse reading tana_workspace_id', () => {
  assert.ok(rules(lintText('s.md', 'Read `tana_workspace_id` (not legacy) and stop if empty.')).includes('workspace-id-source'));
});

test('a node-ID map is always named by its entities. path', () => {
  assert.ok(rules(lintText('s.md', 'Store Tana node ID in `sync-state.yaml` under `projects.tana_node_ids`')).includes('map-path'));
  assert.deepStrictEqual(lintText('s.md', 'Record it in `entities.projects.tana_node_ids.<slug>`.'), []);
});

test('goal map keys carry the period, so next year\'s goals are not mistaken for this year\'s', () => {
  assert.ok(rules(lintText('s.md', 'add `entities.goals.tana_node_ids.<goal_id>: <node ID>`')).includes('goal-map-key'));
  assert.ok(rules(lintText('s.md', 'It records each goal under its `id` in `entities.goals.tana_node_ids`.')).includes('goal-map-key'));
  assert.deepStrictEqual(lintText('s.md', 'add `entities.goals.tana_node_ids.<period>/<goal_id>: <node ID>`'), []);
});

test('support files next to a skill are linted too', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lint-support-'));
  fs.mkdirSync(path.join(root, '.claude', 'commands', 'x'), { recursive: true });
  fs.writeFileSync(path.join(root, '.claude', 'commands', 'x', 'SKILL.md'), 'ok\n');
  fs.writeFileSync(path.join(root, '.claude', 'commands', 'x', 'notes.md'), 'call mcp__tana__read_node\n');
  assert.ok(rules(lintRepo(root)).includes('hardcoded-mcp-server'));
});

test('search_nodes calls name the workspace (live: without workspaceIds both Tana servers return nothing)', () => {
  const bare = fence('search_nodes({\n  query: { and: [{ hasType: "[WIN_TAG_ID]" }] },\n  limit: 10\n})');
  assert.ok(rules(lintText('s.md', bare)).includes('search-without-workspace'));
  assert.ok(rules(lintText('s.md', 'search_nodes({ query: { and: [{ hasType: "[NOTE_TAG_ID]" }] }, limit: 10 })')).includes('search-without-workspace'));
  const scoped = fence('search_nodes({\n  workspaceIds: ["[WORKSPACE_ID]"],\n  query: { and: [{ hasType: "[WIN_TAG_ID]" }] }\n})');
  assert.deepStrictEqual(lintText('s.md', scoped), []);
  assert.deepStrictEqual(lintText('s.md', 'Use `search_nodes` with the tag ID.'), []);
});
