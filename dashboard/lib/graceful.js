'use strict';

/**
 * safeRead — wraps any file-reading function so a missing/malformed file
 * returns null instead of throwing. New ILOS users have empty directories;
 * every data file is optional.
 *
 * @param {Function} fn  zero-arg function that reads and returns data
 * @returns {*} result of fn(), or null on any error
 */
function safeRead(fn) {
  try {
    return fn();
  } catch (_) {
    return null;
  }
}

module.exports = { safeRead };
