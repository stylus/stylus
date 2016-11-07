/**
 * Module dependencies.
 */

export = class NullCache {

/**
 * Set cache item with given `key` to `value`.
 *
 * @param {String} key
 * @param {Object} value
 * @api private
 */

set(key, value) {};

/**
 * Get cache item with given `key`.
 *
 * @param {String} key
 * @return {Object}
 * @api private
 */

get(key) {};

/**
 * Check if cache has given `key`.
 *
 * @param {String} key
 * @return {Boolean}
 * @api private
 */

has(key) {
  return false;
};

/**
 * Generate key for the source `str` with `options`.
 *
 * @param {String} str
 * @param {Object} options
 * @return {String}
 * @api private
 */

key(str, options) {
  return '';
}
}
