/**
 * Module dependencies.
 */

var crypto = require('crypto');

var MemoryCache = module.exports = function() {
  this._cache = {};
};

/**
 * Set cache item with given `key` to `value`.
 *
 * @param {String} key
 * @param {Object} value
 * @api private
 */

MemoryCache.prototype.set = function(key, value) {
  this._cache[key] = value.clone();
};

/**
 * Get cache item with given `key`.
 *
 * @param {String} key
 * @return {Object}
 * @api private
 */

MemoryCache.prototype.get = function(key) {
  return this._cache[key].clone();
};

/**
 * Check if cache has given `key`.
 *
 * @param {String} key
 * @return {Boolean}
 * @api private
 */

MemoryCache.prototype.has = function(key) {
  return key in this._cache;
};

/**
 * Generate key for the source `str` with `options`.
 *
 * @param {String} str
 * @param {Object} options
 * @return {String}
 * @api private
 */

MemoryCache.prototype.key = function(str, options) {
  var hash = crypto.createHash('sha1');
  hash.update(str + options.prefix);
  return hash.digest('hex');
};
