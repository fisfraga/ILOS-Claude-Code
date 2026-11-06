'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { buildIds } = require('./migrate-ids');

const IDS = [
  'workspace:', '  WORKSPACE_ID: ""', '  HOME_NODE_ID: ""',
  'hubs:', '  VISION_HUB_ID: ""',
  'containers:', '  WINS_CONTAINER_ID: ""', '  VISION_FP_CONTAINER_ID: ""', '  VISION_MTP_CONTAINER_ID: ""',
  'tags:', '  WIN_TAG_ID: ""', '  MTP_TAG_ID: ""', '  HHG_TAG_ID: ""', '  DECISION_TAG_ID: ""',
  'fields:', '  PERIODICITY_FIELD_ID: ""', '  AREA_FIELD_ID: ""', '  GOAL_STATUS_FIELD_ID: ""',
  'options:', '  GOAL_ACTIVE_OPTION_ID: ""', '  PERIODICITY_WEEK_OPTION_ID: ""', '  DECISION_SET_ASIDE_OPTION_ID: ""',
  'areas:', '  health: ""', '  finances: ""',
  'capabilities:', '  decision_supertag: unknown', '',
].join('\n');

const TAGS = [
  '## Review Tags', '', '| Tag Name | Tag ID | Notes |', '|---|---|---|',
  '| #win | tagWIN0000001 | |', '| #decision | | Status: Open |',
  '| #massively transformative purpose | tagMTP0000001 | |', '| #high hard goal | tagHHG0000001 | |',
].join('\n');

const FIELDS = [
  '## Common Fields', '| Field Name | Field ID | Used In | Type |', '|---|---|---|---|',
  '| Status | fldSTATUS0001 | Goals | Option |', '| Area | fldAREA000001 | Goals | Reference |',
  '## Win Fields', '| Field Name | Field ID | Used In | Type |', '|---|---|---|---|',
  '| Periodicity | fldPERIOD0001 | #win | Option |',
  '## Decision Fields', '| Field Name | Field ID | Used In | Type |', '|---|---|---|---|',
  '| Area | fldAREA999999 | #decision | Reference |',
  '## Goal Fields', '| Field Name | Field ID | Used In | Type |', '|---|---|---|---|',
  '| Goal Status | fldGOALST0001 | All | Option |',
  '### Periodicity Options', '| Option | Option ID |', '|---|---|', '| Week | optWEEK000001 |',
  '### Goal Status Options', '| Option | Option ID |', '|---|---|', '| Active | optGACTIVE001 |',
  '### Decision Status Options', '| Option | Option ID |', '|---|---|', '| Set Aside | optDSETASIDE1 |',
].join('\n');

const STRUCTURE = [
  '## Workspace', '| Name | Workspace ID | Notes |', '|---|---|---|', '| Main Workspace | wsp000000001 | |',
  '## Hubs', '| Hub Name | Node ID | Notes |', '|---|---|---|', '| Vision Hub | hubVISION0001 | |',
  '## Containers (push targets)', '| Container | Node ID | Notes |', '|---|---|---|',
  '| Wins Log | conWINS000001 | |', '| Favorite Problems | | |',
  '## Key Area Nodes', '| # | Area | Node ID |', '|---|---|---|',
  '| 1 | Health & Vitality | areaHEALTH001 |', '| 2 | Finances & Resources | |',
].join('\n');

const STATE = [
  'entities:', '  areas:', '    last_pull: null', '    tana_node_ids:', '      health: "areaSTATE0001"', '      finances: "areaSTATE0002"',
  '  vision:', '    tana_node_ids:', '      favorite_problems_container: "conFPSTATE001"', '      mtps_container: ""',
].join('\n');

test('fills tag, field, option, workspace, hub, container and area keys from the tables', () => {
  const r = buildIds({ idsText: IDS, tagMd: TAGS, fieldMd: FIELDS, structureMd: STRUCTURE, stateText: '' });
  const get = (k) => (r.text.match(new RegExp(`^\\s+${k}: "([^"]*)"`, 'm')) || [])[1];
  assert.strictEqual(get('WIN_TAG_ID'), 'tagWIN0000001');
  assert.strictEqual(get('MTP_TAG_ID'), 'tagMTP0000001');
  assert.strictEqual(get('HHG_TAG_ID'), 'tagHHG0000001');
  assert.strictEqual(get('PERIODICITY_FIELD_ID'), 'fldPERIOD0001');
  assert.strictEqual(get('GOAL_STATUS_FIELD_ID'), 'fldGOALST0001');
  assert.strictEqual(get('PERIODICITY_WEEK_OPTION_ID'), 'optWEEK000001');
  assert.strictEqual(get('GOAL_ACTIVE_OPTION_ID'), 'optGACTIVE001');
  assert.strictEqual(get('DECISION_SET_ASIDE_OPTION_ID'), 'optDSETASIDE1');
  assert.strictEqual(get('WORKSPACE_ID'), 'wsp000000001');
  assert.strictEqual(get('VISION_HUB_ID'), 'hubVISION0001');
  assert.strictEqual(get('WINS_CONTAINER_ID'), 'conWINS000001');
  assert.strictEqual(get('health'), 'areaHEALTH001');
});

test('the first non-empty value wins and a different later value is a conflict', () => {
  const r = buildIds({ idsText: IDS, tagMd: TAGS, fieldMd: FIELDS, structureMd: STRUCTURE, stateText: '' });
  assert.ok(r.text.includes('AREA_FIELD_ID: "fldAREA000001"'));
  assert.deepStrictEqual(r.conflicts, ['AREA_FIELD_ID']);
});

test('a value already set in the ids file is never overwritten', () => {
  const set = IDS.replace('WIN_TAG_ID: ""', 'WIN_TAG_ID: "mine-already"');
  const r = buildIds({ idsText: set, tagMd: TAGS, fieldMd: FIELDS, structureMd: STRUCTURE, stateText: '' });
  assert.ok(r.text.includes('WIN_TAG_ID: "mine-already"'));
  assert.ok(!r.text.includes('tagWIN0000001'));
});

test('sync-state duplicates fill only what the tables left blank', () => {
  const r = buildIds({ idsText: IDS, tagMd: TAGS, fieldMd: FIELDS, structureMd: STRUCTURE, stateText: STATE });
  assert.ok(r.text.includes('VISION_FP_CONTAINER_ID: "conFPSTATE001"'));
  assert.ok(r.text.includes('health: "areaHEALTH001"'), 'the table value beats the state value');
  assert.ok(r.text.includes('finances: "areaSTATE0002"'));
});

test('reports blanks and unmapped rows by name, never by ID', () => {
  const r = buildIds({ idsText: IDS, tagMd: TAGS, fieldMd: FIELDS, structureMd: STRUCTURE, stateText: '' });
  assert.ok(r.blanks.includes('DECISION_TAG_ID'));
  assert.ok(r.blanks.includes('VISION_MTP_CONTAINER_ID'));
  assert.ok(r.unmapped.includes('field: Status'));
  assert.ok(![...r.blanks, ...r.unmapped, ...r.filled].some((s) => /tagWIN0000001|fldAREA000001/.test(s)));
});

test('running on already-migrated text changes nothing', () => {
  const once = buildIds({ idsText: IDS, tagMd: TAGS, fieldMd: FIELDS, structureMd: STRUCTURE, stateText: STATE });
  const twice = buildIds({ idsText: once.text, tagMd: TAGS, fieldMd: FIELDS, structureMd: STRUCTURE, stateText: STATE });
  assert.strictEqual(twice.text, once.text);
  assert.deepStrictEqual(twice.filled, []);
});

test('the shipped blank tables and the shipped ids file migrate to nothing', () => {
  const root = path.resolve(__dirname, '..', '..');
  const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
  const ids = read('SYSTEM/tana-ids.yaml');
  const r = buildIds({
    idsText: ids,
    tagMd: read('SYSTEM/tana-reference/tag-ids.md'),
    fieldMd: read('SYSTEM/tana-reference/field-ids.md'),
    structureMd: read('SYSTEM/tana-reference/structure-map.md'),
    stateText: read('SYSTEM/sync-state.yaml'),
  });
  assert.strictEqual(r.text, ids);
  assert.deepStrictEqual(r.filled, []);
});
