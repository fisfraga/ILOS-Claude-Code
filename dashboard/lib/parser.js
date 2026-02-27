'use strict';

const fs   = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// ROOT = ILOS-Template directory (one level above dashboard/)
const ROOT = path.resolve(__dirname, '..', '..');

/**
 * Read and parse a YAML file relative to ILOS-Template root.
 * @param {string} relPath  e.g. 'TIME/current-period.yaml'
 * @returns {object}
 */
function readYaml(relPath) {
  const src = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
  return yaml.load(src) || {};
}

/**
 * Read a JSONL file and return an array of parsed objects.
 * Skips blank lines and lines starting with {"_schema" (schema header).
 * @param {string} relPath  e.g. 'MEMORY/wins.jsonl'
 * @returns {Array<object>}
 */
function readJsonl(relPath) {
  const src = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
  return src
    .split('\n')
    .filter(line => {
      const t = line.trim();
      return t && !t.startsWith('{"_schema"');
    })
    .map(line => JSON.parse(line));
}

/**
 * Read a Markdown file as a raw string.
 * @param {string} relPath  e.g. 'QUANTUM/vision/high-hard-goals.md'
 * @returns {string}
 */
function readMarkdown(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

/**
 * List all .md files in a directory (relative to ILOS-Template root).
 * Returns [] if directory doesn't exist.
 * @param {string} relDir  e.g. 'SPACE/projects'
 * @returns {string[]}  full absolute paths
 */
function listFiles(relDir, ext) {
  const dir = path.join(ROOT, relDir);
  if (!fs.existsSync(dir)) return [];
  const extension = ext || '.md';
  return fs.readdirSync(dir)
    .filter(f => f.endsWith(extension))
    .map(f => path.join(dir, f));
}

/**
 * Parse markdown items with configurable extraction options.
 * Used for FPs, MTPs, HHGs and any list-style markdown content.
 *
 * @param {string} text  raw markdown
 * @param {object} [opts]
 * @param {boolean} [opts.bulletsOnly=false]   Only capture bullet/numbered items; skip all headings
 * @param {number|null} [opts.headingLevel=null] Only capture headings at this exact level (1-6); skip all others
 * @param {boolean} [opts.stripBold=true]      Strip **bold** markers from titles
 * @param {boolean} [opts.numbered=true]       Capture numbered list items (1. text)
 * @returns {Array<{title: string}>}
 */
function parseMarkdownItems(text, opts) {
  const options = Object.assign(
    { bulletsOnly: false, headingLevel: null, stripBold: true, numbered: true },
    opts || {}
  );

  function clean(str) {
    let s = str.trim();
    if (options.stripBold) s = s.replace(/\*\*/g, '');
    // Strip sync metadata suffixes (e.g. "Tana: `nodeId`")
    s = s.replace(/\s+Tana:\s*`[^`]+`\s*$/, '').trim();
    return s;
  }

  function shouldSkip(trimmed) {
    if (!trimmed || trimmed === '---') return true;
    if (trimmed.startsWith('Tana:')) return true;
    if (trimmed.startsWith('Synced from Tana')) return true;
    if (trimmed.startsWith('<!--')) return true;
    // Skip italic-only lines (metadata/descriptions, not titles)
    if (/^\*[^*]+\*$/.test(trimmed) || /^_[^_]+_$/.test(trimmed)) return true;
    return false;
  }

  const items = [];
  const lines = text ? text.split('\n') : [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (shouldSkip(trimmed)) continue;

    // Heading lines
    if (trimmed.startsWith('#')) {
      if (options.bulletsOnly) continue;
      const hashes = (trimmed.match(/^(#+)/) || ['', ''])[1].length;
      if (options.headingLevel !== null && hashes !== options.headingLevel) continue;
      const title = clean(trimmed.replace(/^#+\s*/, ''));
      if (title) items.push({ title });
      continue;
    }

    // Bullet list items
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (options.headingLevel !== null) continue; // headingLevel mode: skip bullets
      const title = clean(trimmed.slice(2));
      if (title) items.push({ title });
      continue;
    }

    // Numbered list items (1. text, 12. text, etc.)
    if (options.numbered && /^\d+\.\s+/.test(trimmed)) {
      if (options.headingLevel !== null) continue; // headingLevel mode: skip numbered
      const title = clean(trimmed.replace(/^\d+\.\s+/, ''));
      if (title) items.push({ title });
    }
  }

  return items;
}

/**
 * Extract user name from personal-context manifesto (first # heading).
 * @param {string} text  raw markdown
 * @returns {string|null}
 */
function extractName(text) {
  if (!text) return null;
  const match = text.match(/^#\s+(.+)/m);
  return match ? match[1].trim() : null;
}

module.exports = { readYaml, readJsonl, readMarkdown, listFiles, parseMarkdownItems, extractName, ROOT };
