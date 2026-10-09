'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { classifyAll } = require('./check-manifest');

const manifest = {
  foundation: ['ROUTING.md', 'MEMORY/examples/**', '.claude/**', 'stale/**'],
  starter: ['MEMORY/**', 'QUANTUM/**'],
  user: ['dashboard/extensions/**', 'CLAUDE.local.md'],
};

test('user data is a starter, shipped examples are foundation', () => {
  const r = classifyAll(
    ['MEMORY/wins.jsonl', 'MEMORY/examples/sample-wins.jsonl', 'QUANTUM/personal-context/8-identity-values.md', 'ROUTING.md'],
    manifest
  );
  assert.strictEqual(r.classified['MEMORY/wins.jsonl'], 'starter');
  assert.strictEqual(r.classified['MEMORY/examples/sample-wins.jsonl'], 'foundation');
  assert.strictEqual(r.classified['QUANTUM/personal-context/8-identity-values.md'], 'starter');
  assert.strictEqual(r.classified['ROUTING.md'], 'foundation');
});

test('extension files are user-owned', () => {
  const r = classifyAll(['dashboard/extensions/mine.js'], manifest);
  assert.strictEqual(r.classified['dashboard/extensions/mine.js'], 'user');
});

test('an unclassified file is reported', () => {
  const r = classifyAll(['random.txt'], manifest);
  assert.deepStrictEqual(r.unclassified, ['random.txt']);
});

test('the same pattern in two classes is a conflict', () => {
  const r = classifyAll(['A/b.md'], { foundation: ['A/**'], starter: ['A/**'] });
  assert.deepStrictEqual(r.conflicts, ['A/b.md']);
  assert.deepStrictEqual(r.classified, {});
});

test('an exact path beats a prefix pattern', () => {
  const r = classifyAll(['SYSTEM/sync-config.yaml'], { foundation: ['SYSTEM/**'], starter: ['SYSTEM/sync-config.yaml'] });
  assert.strictEqual(r.classified['SYSTEM/sync-config.yaml'], 'starter');
});

test('stale foundation and starter patterns are reported, user patterns are not', () => {
  const r = classifyAll(['ROUTING.md', 'MEMORY/wins.jsonl'], manifest);
  assert.ok(r.unusedPatterns.includes('stale/**'));
  assert.ok(!r.unusedPatterns.includes('dashboard/extensions/**'));
  assert.ok(!r.unusedPatterns.includes('CLAUDE.local.md'));
});

// Review Focus 5: user data must never be classified as foundation by the real manifest.
// Skipped when js-yaml is not installed (dashboard/node_modules).
const realRoot = require('path').resolve(__dirname, '..', '..');
let realManifest = null;
try { realManifest = require('./check-manifest').loadManifest(realRoot); } catch (err) { /* js-yaml missing */ }

test('the real manifest never classifies user-written paths as foundation', { skip: !realManifest }, () => {
  const userPaths = [
    'MEMORY/wins.jsonl',
    'MEMORY/decisions.jsonl',
    'QUANTUM/personal-context/8-identity-values.md',
    'QUANTUM/vision/favorite-problems.md',
    'SPACE/areas/health.md',
    'SPACE/projects/my-project.md',
    'SPACE/products/dashboards/my-dashboard.html',
    'SPACE/products/my-product/index.html',
    'TIME/active-goals.yaml',
    'SYSTEM/sync-config.yaml',
    'SYSTEM/sync-state.yaml',
    'SYSTEM/tana-reference/tag-ids.md',
    'dashboard/extensions/mine.js',
  ];
  const r = classifyAll(userPaths, realManifest);
  const asFoundation = userPaths.filter((p) => r.classified[p] === 'foundation');
  assert.deepStrictEqual(asFoundation, []);
});
