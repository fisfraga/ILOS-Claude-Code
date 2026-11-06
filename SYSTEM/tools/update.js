#!/usr/bin/env node
'use strict';
// Updates the template files (foundation) to a newer release without touching your data.
// Plain Node, no dependencies. Used by the /update skill.
//
//   node SYSTEM/tools/update.js plan  <newReleaseDir> [--root <dir>]   dry run: lists what would change
//   node SYSTEM/tools/update.js apply <newReleaseDir> [--root <dir>]   applies the same plan
//   node SYSTEM/tools/update.js release [--root <dir>]                 maintainer only: writes
//                                                                      SYSTEM/release-manifest.json
//
// Rules (SYSTEM/foundation-manifest.yaml decides the class of every path):
//   foundation — added if missing, replaced if changed. If you edited it, your copy is kept as <file>.bak.
//                Removed only if the new release no longer ships it AND you never edited it.
//   starter    — your data. Added only if missing; never overwritten.
//   user       — never shipped, never touched.
// A record of every apply is appended to SYSTEM/update-log.md.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MANIFEST = 'SYSTEM/release-manifest.json';
const LOG = 'SYSTEM/update-log.md';
const LEGACY_TAG = 'pre-1.0'; // last commit before 1.0; its history is what older copies came from

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function assertSafe(p) {
  const parts = p.split(/[\\/]/);
  if (!p || path.isAbsolute(p) || /^[a-zA-Z]:/.test(p) || parts.includes('..')) {
    throw new Error(`unsafe path in release manifest: ${p}`);
  }
}

function planUpdate({ oldManifest, newManifest, localHash }) {
  const plan = { add: [], update: [], updateWithBackup: [], unchanged: [], keepStarter: [], remove: [], keepRemovedModified: [] };
  const oldFiles = (oldManifest && oldManifest.files) || {};
  const newFiles = newManifest.files || {};
  // A copy without a release manifest predates 1.0: a file counts as unedited if it matches
  // any version the template ever shipped (newManifest.legacy).
  const legacy = (!oldManifest && newManifest.legacy) || {};
  const shippedBefore = (f, local) => (oldManifest
    ? Boolean(oldFiles[f] && oldFiles[f].class === 'foundation' && oldFiles[f].sha256 === local)
    : (legacy[f] || []).includes(local));

  for (const f of Object.keys(newFiles).sort()) {
    assertSafe(f);
    const entry = newFiles[f];
    const local = localHash(f);
    if (entry.class === 'starter') {
      (local === null ? plan.add : plan.keepStarter).push(f);
      continue;
    }
    if (entry.class !== 'foundation') continue;
    if (local === null) plan.add.push(f);
    else if (local === entry.sha256) plan.unchanged.push(f);
    else if (shippedBefore(f, local)) plan.update.push(f);
    else plan.updateWithBackup.push(f);
  }

  for (const f of Object.keys(oldFiles).sort()) {
    if (newFiles[f] || oldFiles[f].class !== 'foundation') continue;
    assertSafe(f);
    const local = localHash(f);
    if (local === null) continue;
    (local === oldFiles[f].sha256 ? plan.remove : plan.keepRemovedModified).push(f);
  }
  return plan;
}

function summarize(plan) {
  const lines = [];
  const section = (title, list, note = (f) => f) => {
    if (!list.length) return;
    lines.push(`${title} (${list.length}):`);
    list.forEach((f) => lines.push(`  ${note(f)}`));
  };
  section('Add', plan.add);
  section('Update', plan.update);
  section('Update, keeping your edited copy', plan.updateWithBackup, (f) => `${f} (your copy saved as ${f}.bak)`);
  section('Remove (no longer shipped, never edited)', plan.remove);
  section('Left in place (no longer shipped, but you edited it)', plan.keepRemovedModified);
  lines.push(`Unchanged: ${plan.unchanged.length} template files · Your data kept as is: ${plan.keepStarter.length} files`);
  return lines.join('\n');
}

function applyUpdate({ plan, root, sourceRoot, fromVersion, toVersion, now = new Date() }) {
  const newManifest = JSON.parse(fs.readFileSync(path.join(sourceRoot, MANIFEST), 'utf8'));
  const copy = (f) => {
    const data = fs.readFileSync(path.join(sourceRoot, f));
    const expected = newManifest.files[f] && newManifest.files[f].sha256;
    if (expected && sha256(data) !== expected) throw new Error(`downloaded file does not match the release manifest: ${f}`);
    fs.mkdirSync(path.dirname(path.join(root, f)), { recursive: true });
    fs.writeFileSync(path.join(root, f), data);
  };
  for (const f of plan.updateWithBackup) fs.copyFileSync(path.join(root, f), path.join(root, `${f}.bak`));
  [...plan.add, ...plan.update, ...plan.updateWithBackup].forEach(copy);
  for (const f of plan.remove) fs.unlinkSync(path.join(root, f));
  fs.mkdirSync(path.join(root, 'SYSTEM'), { recursive: true });
  fs.copyFileSync(path.join(sourceRoot, MANIFEST), path.join(root, MANIFEST));

  const date = now.toISOString().slice(0, 10);
  const logPath = path.join(root, LOG);
  const head = fs.existsSync(logPath) ? '' : '# Update log\n\nWritten by /update. One entry per applied update.\n';
  fs.appendFileSync(logPath, `${head}\n## ${date} · ${fromVersion} → ${toVersion}\n\n${summarize(plan)}\n`);
}

function buildRelease({ version, files, classify, read, legacy = null }) {
  const out = { version, files: {} };
  for (const f of files) {
    if (f === MANIFEST) continue;
    const cls = classify(f);
    if (cls !== 'foundation' && cls !== 'starter') continue;
    out.files[f] = { class: cls, sha256: sha256(read(f)) };
  }
  if (legacy) {
    out.legacy = {};
    for (const f of Object.keys(out.files).sort()) {
      if (out.files[f].class !== 'foundation' || !legacy[f]) continue;
      const hashes = [...new Set(legacy[f])].filter((x) => x !== out.files[f].sha256);
      if (hashes.length) out.legacy[f] = hashes;
    }
  }
  return out;
}

// Every version of every path in the commits reachable from `rev` (the pre-1.0 history),
// as sha256 lists, so an unversioned copy can be matched against what was actually shipped.
function legacyHashes(root, rev) {
  const { execFileSync } = require('child_process');
  const git = (...a) => execFileSync('git', a, { cwd: root, maxBuffer: 1 << 28 });
  const byPath = {};
  const blobHash = {};
  for (const commit of git('rev-list', rev).toString().split('\n').filter(Boolean)) {
    for (const line of git('ls-tree', '-r', commit).toString().split('\n').filter(Boolean)) {
      const [meta, file] = line.split('\t');
      const blob = meta.split(' ')[2];
      if (!blobHash[blob]) blobHash[blob] = sha256(git('cat-file', 'blob', blob));
      (byPath[file] = byPath[file] || new Set()).add(blobHash[blob]);
    }
  }
  return Object.fromEntries(Object.entries(byPath).map(([f, set]) => [f, [...set]]));
}

module.exports = { planUpdate, applyUpdate, buildRelease, legacyHashes, summarize, sha256 };

if (require.main === module) {
  const args = process.argv.slice(2);
  const rootIdx = args.indexOf('--root');
  const root = path.resolve(rootIdx >= 0 ? args[rootIdx + 1] : process.cwd());
  const positional = args.filter((a, i) => !a.startsWith('--') && (rootIdx < 0 || i !== rootIdx + 1));
  const [cmd, source] = positional;
  const readVersion = (dir) => {
    const p = path.join(dir, 'VERSION');
    return fs.existsSync(p) ? fs.readFileSync(p, 'utf8').trim() : 'unversioned';
  };

  if (cmd === 'release') {
    const { execFileSync } = require('child_process');
    const { classifyAll, loadManifest } = require('./check-manifest');
    const files = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);
    const r = classifyAll(files, loadManifest(root));
    let legacy = null;
    try {
      execFileSync('git', ['rev-parse', '--verify', '--quiet', `${LEGACY_TAG}^{commit}`], { cwd: root, stdio: 'ignore' });
      legacy = legacyHashes(root, LEGACY_TAG);
    } catch (err) { /* no pre-1.0 tag: no legacy matching */ }
    const m = buildRelease({
      version: readVersion(root),
      files,
      classify: (f) => r.classified[f],
      read: (f) => fs.readFileSync(path.join(root, f)),
      legacy,
    });
    fs.writeFileSync(path.join(root, MANIFEST), `${JSON.stringify(m, null, 2)}\n`);
    console.log(`wrote ${MANIFEST}: version ${m.version}, ${Object.keys(m.files).length} files, legacy versions for ${Object.keys(m.legacy || {}).length} files`);
  } else if ((cmd === 'plan' || cmd === 'apply') && source) {
    const src = path.resolve(source);
    const newPath = path.join(src, MANIFEST);
    if (!fs.existsSync(newPath)) {
      console.error(`no ${MANIFEST} in ${src}: not an ILOS release folder`);
      process.exit(1);
    }
    const newManifest = JSON.parse(fs.readFileSync(newPath, 'utf8'));
    const oldPath = path.join(root, MANIFEST);
    const oldManifest = fs.existsSync(oldPath) ? JSON.parse(fs.readFileSync(oldPath, 'utf8')) : null;
    const localHash = (f) => {
      const p = path.join(root, f);
      return fs.existsSync(p) ? sha256(fs.readFileSync(p)) : null;
    };
    const plan = planUpdate({ oldManifest, newManifest, localHash });
    const from = readVersion(root);
    console.log(`ILOS ${from} → ${newManifest.version}\n`);
    console.log(summarize(plan));
    if (cmd === 'apply') {
      applyUpdate({ plan, root, sourceRoot: src, fromVersion: from, toVersion: newManifest.version });
      console.log(`\napplied; recorded in ${LOG}`);
    } else {
      console.log('\ndry run: nothing changed (run apply to make these changes)');
    }
  } else {
    console.error('usage: update.js plan|apply <newReleaseDir> [--root <dir>]  |  update.js release [--root <dir>]');
    process.exit(2);
  }
}
