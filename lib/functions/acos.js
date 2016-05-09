var utils = require('../utils')
  , nodes = require('../nodes')
	, convert = require('./convert-angle')
	, asin    = require('./asin');

/**
 * Return the tangent of the given `angle`.
 *
 * @param {Unit} angle
 * @return {Unit}
 * @api public
 */

module.exports = function acos(trigValue, output) {
	var output = typeof output !== 'undefined' ? output : 'deg';
	var convertedValue = convert(Math.PI / 2, output) - asin(trigValue, output);
  return new nodes.Unit(convertedValue, output);
};
