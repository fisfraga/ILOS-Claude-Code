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

// ── Safety guards (1.0 review) ──────────────────────────────────────────────

const H = (s) => h(s);
const valid = (files, extra = {}) => ({ version: '1.1.0', files: { 'SYSTEM/tools/update.js': { class: 'foundation', sha256: H('tool') }, ...files }, ...extra });
const tmpRoot = () => fs.mkdtempSync(path.join(os.tmpdir(), 'ilos-update-'));
const put = (base, f, s) => { fs.mkdirSync(path.dirname(path.join(base, f)), { recursive: true }); fs.writeFileSync(path.join(base, f), s); };

test('the local tool, not the release manifest, decides what is user data', () => {
  const newM = valid({
    'MEMORY/wins.jsonl': { class: 'foundation', sha256: H('wiped') },
    'memory/wins.jsonl': { class: 'foundation', sha256: H('wiped') },
    'SYSTEM/Tana-IDs.yaml': { class: 'foundation', sha256: H('x') },
    'CLAUDE.local.md': { class: 'foundation', sha256: H('x') },
    'dashboard/extensions/mine.js': { class: 'foundation', sha256: H('x') },
    '.git/hooks/pre-commit': { class: 'foundation', sha256: H('x') },
    'SYSTEM/update-log.md': { class: 'starter', sha256: H('x') },
    'MEMORY/MODULE.md': { class: 'foundation', sha256: H('module') },
  });
  const p = planUpdate({ oldManifest: null, newManifest: newM, localHash: (f) => (f === 'SYSTEM/tools/update.js' ? H('tool') : f === 'MEMORY/MODULE.md' ? null : H('mine')) });
  assert.deepStrictEqual(p.update, []);
  assert.deepStrictEqual(p.updateWithBackup, []);
  assert.deepStrictEqual(p.keepStarter.sort(), ['MEMORY/wins.jsonl', 'SYSTEM/Tana-IDs.yaml', 'memory/wins.jsonl']);
  assert.deepStrictEqual(p.refused.map((r) => r.file).sort(), ['.git/hooks/pre-commit', 'CLAUDE.local.md', 'SYSTEM/update-log.md', 'dashboard/extensions/mine.js']);
  assert.deepStrictEqual(p.add, ['MEMORY/MODULE.md']);
});

test('the built-in data list agrees with SYSTEM/foundation-manifest.yaml for every tracked file', () => {
  const { localClass } = require('./update');
  const { classifyAll, loadManifest } = require('./check-manifest');
  const root = path.join(__dirname, '..', '..');
  const files = require('child_process').execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);
  const r = classifyAll(files, loadManifest(root));
  const extra = ['CLAUDE.local.md', 'SYSTEM/update-log.md', 'dashboard/extensions/x.js', 'MEMORY/my-notes.md', 'SPACE/projects/mine/README.md'];
  const yamlR = classifyAll(extra, loadManifest(root));
  const all = { ...r.classified, ...yamlR.classified };
  const drift = Object.entries(all).filter(([f, cls]) => (localClass(f) || 'foundation') !== cls).map(([f, cls]) => `${f}: yaml ${cls}, tool ${localClass(f) || 'foundation'}`);
  assert.deepStrictEqual(drift, []);
});

test('an invalid release manifest is refused before planning', () => {
  const plan = (m) => planUpdate({ oldManifest: rel('1.0.0', { 'a.md': { class: 'foundation', sha256: H('a') } }), newManifest: m, localHash: () => H('a') });
  assert.throws(() => plan({ version: '1.1.0' }), /invalid release manifest/);
  assert.throws(() => plan({ version: 1, files: { 'SYSTEM/tools/update.js': { class: 'foundation', sha256: H('t') } } }), /invalid release manifest/);
  assert.throws(() => plan(valid({ 'README.md': { class: 'foundation' } })), /invalid release manifest/);
  assert.throws(() => plan(valid({ 'README.md': { class: 'weird', sha256: H('r') } })), /invalid release manifest/);
  const { checkRelease } = require('./update');
  assert.throws(() => checkRelease(rel('1.1.0', { 'README.md': { class: 'foundation', sha256: H('r') } })), /does not ship SYSTEM\/tools\/update\.js/);
  assert.doesNotThrow(() => checkRelease(valid({})));
  assert.throws(() => plan(valid({ 'a\\b.md': { class: 'foundation', sha256: H('r') } })), /unsafe path/);
});

test('a symlinked path is refused, never written through', () => {
  const newM = valid({ 'AGENTS.md': { class: 'foundation', sha256: H('agents') }, 'ILOS-KNOWLEDGE/x.md': { class: 'foundation', sha256: H('x') } });
  const p = planUpdate({ oldManifest: null, newManifest: newM, localHash: () => H('other'), isLink: (f) => f !== 'SYSTEM/tools/update.js' });
  assert.deepStrictEqual(p.refused.map((r) => r.file).sort(), ['AGENTS.md', 'ILOS-KNOWLEDGE/x.md']);
  assert.deepStrictEqual(p.updateWithBackup, ['SYSTEM/tools/update.js']);
  assert.deepStrictEqual(p.update, []);
});

test('a second backup never overwrites the first', () => {
  const tmp = tmpRoot();
  const root = path.join(tmp, 'root');
  const src = path.join(tmp, 'src');
  put(root, 'm.md', 'edit B');
  put(root, 'm.md.bak', 'edit A');
  put(src, 'm.md', 'theirs');
  put(src, 'SYSTEM/tools/update.js', 'tool');
  const newM = valid({ 'm.md': { class: 'foundation', sha256: H('theirs') } });
  newM.files['SYSTEM/tools/update.js'].sha256 = H('tool');
  put(src, 'SYSTEM/release-manifest.json', JSON.stringify(newM));
  const p = planUpdate({ oldManifest: null, newManifest: newM, localHash: (f) => (fs.existsSync(path.join(root, f)) ? sha256(fs.readFileSync(path.join(root, f))) : null), exists: (f) => fs.existsSync(path.join(root, f)) });
  assert.strictEqual(p.backups['m.md'], 'm.md.bak.2');
  applyUpdate({ plan: p, root, sourceRoot: src, fromVersion: '1.0.0', toVersion: '1.1.0' });
  assert.strictEqual(fs.readFileSync(path.join(root, 'm.md.bak'), 'utf8'), 'edit A');
  assert.strictEqual(fs.readFileSync(path.join(root, 'm.md.bak.2'), 'utf8'), 'edit B');
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('a corrupt download changes nothing (checked before the first write)', () => {
  const tmp = tmpRoot();
  const root = path.join(tmp, 'root');
  const src = path.join(tmp, 'src');
  put(root, 'VERSION', '1.0.0\n');
  put(root, 'z.md', 'old');
  put(src, 'VERSION', '1.1.0\n');
  put(src, 'z.md', 'tampered');
  put(src, 'SYSTEM/tools/update.js', 'tool');
  const newM = valid({ 'VERSION': { class: 'foundation', sha256: H('1.1.0\n') }, 'z.md': { class: 'foundation', sha256: H('new') } });
  newM.files['SYSTEM/tools/update.js'].sha256 = H('tool');
  put(src, 'SYSTEM/release-manifest.json', JSON.stringify(newM));
  const p = planUpdate({ oldManifest: null, newManifest: newM, localHash: (f) => (fs.existsSync(path.join(root, f)) ? sha256(fs.readFileSync(path.join(root, f))) : null) });
  assert.throws(() => applyUpdate({ plan: p, root, sourceRoot: src, fromVersion: '1.0.0', toVersion: '1.1.0' }), /does not match the release manifest: z\.md/);
  assert.deepStrictEqual(fs.readdirSync(root).sort(), ['VERSION', 'z.md']);
  assert.strictEqual(fs.readFileSync(path.join(root, 'VERSION'), 'utf8'), '1.0.0\n');
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('the CLI refuses a folder that is not an ILOS copy, and a --root without a value', () => {
  const { spawnSync } = require('child_process');
  const tool = path.join(__dirname, 'update.js');
  const tmp = tmpRoot();
  const src = path.join(tmp, 'src');
  put(src, 'SYSTEM/release-manifest.json', JSON.stringify(valid({})));
  const notIlos = path.join(tmp, 'home');
  fs.mkdirSync(notIlos);
  const r1 = spawnSync('node', [tool, 'plan', src, '--root', notIlos], { encoding: 'utf8' });
  assert.notStrictEqual(r1.status, 0);
  assert.match(r1.stderr, /not an ILOS folder/);
  const r2 = spawnSync('node', [tool, 'plan', src, '--root'], { encoding: 'utf8' });
  assert.notStrictEqual(r2.status, 0);
  assert.match(r2.stderr, /--root needs a folder/);
  fs.rmSync(tmp, { recursive: true, force: true });
});
