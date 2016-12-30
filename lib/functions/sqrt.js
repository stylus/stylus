var utils = require('../utils')
  , nodes = require('../nodes');

/**
 * Return the square root of the given `value`.
 *
 * @param {Unit} value
 * @return {Unit}
 * @api public
 */

module.exports = function sqrt(value) {
  var sqrt = Math.sqrt(value);

  return new nodes.Unit(sqrt, '');
};
