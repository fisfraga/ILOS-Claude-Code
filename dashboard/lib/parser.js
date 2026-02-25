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
 * Parse markdown headings / bullet list items as simple string entries.
 * Used for FPs, MTPs, HHGs.
 * @param {string} text  raw markdown
 * @returns {Array<{title: string}>}
 */
function parseMarkdownItems(text) {
  const items = [];
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip empty lines, YAML frontmatter markers, comment lines
    if (!trimmed || trimmed === '---') continue;
    // Headings (## Title)
    if (trimmed.startsWith('#')) {
      const title = trimmed.replace(/^#+\s*/, '').trim();
      if (title) items.push({ title });
      continue;
    }
    // Bullet list items (- Title or * Title)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const title = trimmed.slice(2).trim();
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
