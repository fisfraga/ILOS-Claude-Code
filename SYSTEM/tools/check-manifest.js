#!/usr/bin/env node
'use strict';
// Verifies that every tracked file is classified exactly once by SYSTEM/foundation-manifest.yaml.
//
//   node SYSTEM/tools/check-manifest.js [templateRoot]   (exits 1 on any problem)
//
// Needs js-yaml, which lives in dashboard/node_modules (run `npm install` in dashboard/ first).

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const CLASSES = ['foundation', 'starter', 'user'];

function matches(pattern, file) {
  return pattern.endsWith('/**') ? file.startsWith(pattern.slice(0, -2)) : file === pattern;
}

function specificity(pattern) {
  return pattern.endsWith('/**') ? pattern.length : 1e6 + pattern.length;
}

function classifyAll(files, manifest) {
  const result = { classified: {}, unclassified: [], conflicts: [], unusedPatterns: [] };
  const used = new Set();

  for (const file of files) {
    let best = null;
    let tie = false;
    for (const cls of CLASSES) {
      for (const pattern of manifest[cls] || []) {
        if (!matches(pattern, file)) continue;
        const s = specificity(pattern);
        if (!best || s > best.s) {
          best = { cls, pattern, s };
          tie = false;
        } else if (s === best.s && cls !== best.cls) {
          tie = true;
        }
      }
    }
    if (!best) result.unclassified.push(file);
    else if (tie) result.conflicts.push(file);
    else {
      result.classified[file] = best.cls;
      used.add(best.pattern);
    }
  }

  for (const cls of ['foundation', 'starter']) {
    for (const pattern of manifest[cls] || []) {
      if (!used.has(pattern)) result.unusedPatterns.push(pattern);
    }
  }
  return result;
}

function loadManifest(root) {
  let yaml;
  try {
    yaml = require(path.join(root, 'dashboard', 'node_modules', 'js-yaml'));
  } catch (err) {
    throw new Error('js-yaml not found: run `npm install` in dashboard/ first');
  }
  return yaml.load(fs.readFileSync(path.join(root, 'SYSTEM', 'foundation-manifest.yaml'), 'utf8'));
}

module.exports = { classifyAll, loadManifest };

if (require.main === module) {
  const root = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
  const files = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);
  const r = classifyAll(files, loadManifest(root));
  const counts = { foundation: 0, starter: 0, user: 0 };
  Object.values(r.classified).forEach((c) => { counts[c] += 1; });
  console.log(`tracked files: ${files.length} (foundation ${counts.foundation}, starter ${counts.starter}, user ${counts.user})`);
  r.unclassified.forEach((f) => console.log(`UNCLASSIFIED ${f}`));
  r.conflicts.forEach((f) => console.log(`CONFLICT ${f}`));
  r.unusedPatterns.forEach((p) => console.log(`UNUSED PATTERN ${p}`));
  const bad = r.unclassified.length + r.conflicts.length + r.unusedPatterns.length;
  console.log(bad ? `\n${bad} problem(s)` : 'check-manifest: clean');
  process.exit(bad ? 1 : 0);
}
