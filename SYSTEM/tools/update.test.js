'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { planUpdate, applyUpdate, sha256, buildRelease } = require('./update');

const h = (s) => sha256(Buffer.from(s));
const rel = (version, files) => ({ version, files });

test('foundation: missing is added, identical is unchanged, clean change is updated', () => {
  const oldM = rel('1.0.0', { 'a.md': { class: 'foundation', sha256: h('a1') }, 'b.md': { class: 'foundation', sha256: h('b1') } });
  const newM = rel('1.1.0', {
    'a.md': { class: 'foundation', sha256: h('a2') },
    'b.md': { class: 'foundation', sha256: h('b1') },
    'c.md': { class: 'foundation', sha256: h('c1') },
  });
  const local = { 'a.md': h('a1'), 'b.md': h('b1') };
  const p = planUpdate({ oldManifest: oldM, newManifest: newM, localHash: (f) => local[f] || null });
  assert.deepStrictEqual(p.add, ['c.md']);
  assert.deepStrictEqual(p.update, ['a.md']);
  assert.deepStrictEqual(p.updateWithBackup, []);
  assert.deepStrictEqual(p.unchanged, ['b.md']);
});

test('a locally modified foundation file is replaced with a .bak copy kept', () => {
  const oldM = rel('1.0.0', { 'a.md': { class: 'foundation', sha256: h('a1') } });
  const newM = rel('1.1.0', { 'a.md': { class: 'foundation', sha256: h('a2') } });
  const p = planUpdate({ oldManifest: oldM, newManifest: newM, localHash: () => h('mine') });
  assert.deepStrictEqual(p.updateWithBackup, ['a.md']);
});

test('without an old manifest every differing foundation file is treated as modified', () => {
  const newM = rel('1.0.0', { 'a.md': { class: 'foundation', sha256: h('a2') } });
  const p = planUpdate({ oldManifest: null, newManifest: newM, localHash: () => h('a1') });
  assert.deepStrictEqual(p.updateWithBackup, ['a.md']);
});

test('a pre-1.0 copy: files matching any earlier shipped version update cleanly, edited ones get a .bak', () => {
  const newM = {
    version: '1.0.0',
    files: { 'a.md': { class: 'foundation', sha256: h('a2') }, 'b.md': { class: 'foundation', sha256: h('b2') } },
    legacy: { 'a.md': [h('a0'), h('a1')], 'b.md': [h('b1')] },
  };
  const local = { 'a.md': h('a0'), 'b.md': h('my edit') };
  const p = planUpdate({ oldManifest: null, newManifest: newM, localHash: (f) => local[f] || null });
  assert.deepStrictEqual(p.update, ['a.md']);
  assert.deepStrictEqual(p.updateWithBackup, ['b.md']);
});

test('legacy hashes are ignored once the copy has a release manifest', () => {
  const oldM = rel('1.0.0', { 'a.md': { class: 'foundation', sha256: h('a1') } });
  const newM = { version: '1.1.0', files: { 'a.md': { class: 'foundation', sha256: h('a2') } }, legacy: { 'a.md': [h('a0')] } };
  const p = planUpdate({ oldManifest: oldM, newManifest: newM, localHash: () => h('a0') });
  assert.deepStrictEqual(p.updateWithBackup, ['a.md']);
});

test('buildRelease keeps legacy hashes only for shipped foundation files', () => {
  const m = buildRelease({
    version: '1.0.0',
    files: ['README.md', 'MEMORY/wins.jsonl'],
    classify: (f) => ({ 'README.md': 'foundation', 'MEMORY/wins.jsonl': 'starter' })[f],
    read: (f) => Buffer.from(f),
    legacy: { 'README.md': [h('old readme'), h('README.md')], 'MEMORY/wins.jsonl': [h('x')], 'gone.md': [h('g')] },
  });
  assert.deepStrictEqual(m.legacy, { 'README.md': [h('old readme')] });
});

test('starter files are only added when missing, never overwritten', () => {
  const newM = rel('1.1.0', {
    'MEMORY/wins.jsonl': { class: 'starter', sha256: h('') },
    'SYSTEM/tana-ids.yaml': { class: 'starter', sha256: h('ids') },
  });
  const local = { 'MEMORY/wins.jsonl': h('my wins') };
  const p = planUpdate({ oldManifest: null, newManifest: newM, localHash: (f) => local[f] || null });
  assert.deepStrictEqual(p.add, ['SYSTEM/tana-ids.yaml']);
  assert.deepStrictEqual(p.keepStarter, ['MEMORY/wins.jsonl']);
  assert.deepStrictEqual(p.update, []);
});

test('a foundation file dropped upstream is removed only if unmodified', () => {
  const oldM = rel('1.0.0', { 'x.md': { class: 'foundation', sha256: h('x') }, 'y.md': { class: 'foundation', sha256: h('y') } });
  const newM = rel('1.1.0', {});
  const local = { 'x.md': h('x'), 'y.md': h('edited') };
  const p = planUpdate({ oldManifest: oldM, newManifest: newM, localHash: (f) => local[f] || null });
  assert.deepStrictEqual(p.remove, ['x.md']);
  assert.deepStrictEqual(p.keepRemovedModified, ['y.md']);
});

test('paths that escape the template root are rejected', () => {
  for (const bad of ['../evil.md', '/etc/passwd', 'a/../../b', 'a\\..\\b']) {
    const newM = rel('1.1.0', { [bad]: { class: 'foundation', sha256: h('z') } });
    assert.throws(() => planUpdate({ oldManifest: null, newManifest: newM, localHash: () => null }), /unsafe path/);
  }
});

test('buildRelease lists foundation and starter files with hashes, never user files', () => {
  const m = buildRelease({
    version: '1.0.0',
    files: ['README.md', 'MEMORY/wins.jsonl', 'CLAUDE.local.md', 'SYSTEM/release-manifest.json'],
    classify: (f) => ({ 'README.md': 'foundation', 'MEMORY/wins.jsonl': 'starter', 'CLAUDE.local.md': 'user', 'SYSTEM/release-manifest.json': 'foundation' })[f],
    read: (f) => Buffer.from(f),
  });
  assert.strictEqual(m.version, '1.0.0');
  assert.deepStrictEqual(Object.keys(m.files).sort(), ['MEMORY/wins.jsonl', 'README.md']);
  assert.strictEqual(m.files['README.md'].sha256, h('README.md'));
});

test('applyUpdate writes files, keeps .bak, removes, installs the new manifest and logs', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ilos-update-'));
  const root = path.join(tmp, 'root');
  const src = path.join(tmp, 'src');
  const put = (base, f, s) => { fs.mkdirSync(path.dirname(path.join(base, f)), { recursive: true }); fs.writeFileSync(path.join(base, f), s); };
  put(root, 'a.md', 'a1');
  put(root, 'mod.md', 'mine');
  put(root, 'old.md', 'old');
  put(root, 'MEMORY/wins.jsonl', 'my wins');
  put(src, 'a.md', 'a2');
  put(src, 'mod.md', 'theirs');
  put(src, 'new/c.md', 'c1');
  put(src, 'MEMORY/wins.jsonl', '');
  put(src, 'VERSION', '1.1.0\n');
  const newM = rel('1.1.0', {
    'a.md': { class: 'foundation', sha256: h('a2') },
    'mod.md': { class: 'foundation', sha256: h('theirs') },
    'new/c.md': { class: 'foundation', sha256: h('c1') },
    'MEMORY/wins.jsonl': { class: 'starter', sha256: h('') },
    'VERSION': { class: 'foundation', sha256: h('1.1.0\n') },
  });
  put(src, 'SYSTEM/release-manifest.json', JSON.stringify(newM));
  const oldM = rel('1.0.0', {
    'a.md': { class: 'foundation', sha256: h('a1') },
    'mod.md': { class: 'foundation', sha256: h('m1') },
    'old.md': { class: 'foundation', sha256: h('old') },
  });
  const localHash = (f) => (fs.existsSync(path.join(root, f)) ? sha256(fs.readFileSync(path.join(root, f))) : null);
  const p = planUpdate({ oldManifest: oldM, newManifest: newM, localHash });
  applyUpdate({ plan: p, root, sourceRoot: src, fromVersion: '1.0.0', toVersion: '1.1.0', now: new Date('2026-11-06T12:00:00Z') });

  const rd = (f) => fs.readFileSync(path.join(root, f), 'utf8');
  assert.strictEqual(rd('a.md'), 'a2');
  assert.strictEqual(rd('mod.md'), 'theirs');
  assert.strictEqual(rd('mod.md.bak'), 'mine');
  assert.strictEqual(rd('new/c.md'), 'c1');
  assert.strictEqual(rd('MEMORY/wins.jsonl'), 'my wins');
  assert.strictEqual(fs.existsSync(path.join(root, 'old.md')), false);
  assert.strictEqual(rd('VERSION'), '1.1.0\n');
  assert.deepStrictEqual(JSON.parse(rd('SYSTEM/release-manifest.json')), newM);
  assert.match(rd('SYSTEM/update-log.md'), /2026-11-06 · 1\.0\.0 → 1\.1\.0/);
  assert.match(rd('SYSTEM/update-log.md'), /mod\.md \(your copy saved as mod\.md\.bak\)/);
});
