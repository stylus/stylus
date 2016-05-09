var utils = require('../utils')
  , nodes = require('../nodes')
	, convert = require('./convert-angle');

/**
 * Return the tangent of the given `angle`.
 *
 * @param {Unit} angle
 * @return {Unit}
 * @api public
 */

module.exports = function atan(trigValue, output) {
	var output = typeof output !== 'undefined' ? output : 'deg';
	var value = Math.asin(trigValue) ;
	var convertedValue = convert(value, output);
  return new nodes.Unit(convertedValue, output);
};
