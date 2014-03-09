/**
 * Module dependencies.
 */

var crypto = require('crypto')
  , utils = require('../utils');

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
  this._cache[key] = value;
};

/**
 * Get cache item with given `key`.
 *
 * @param {String} key
 * @return {Object}
 * @api private
 */

MemoryCache.prototype.get = function(key) {
  return this._cache[key];
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
  options = utils.merge({}, options);
  options.root = options.filename = options.Evaluator = null;
  hash.update(str + JSON.stringify(options));
  return hash.digest('hex');
};
