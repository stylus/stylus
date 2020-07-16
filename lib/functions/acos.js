var utils = require('../utils')
  , nodes = require('../nodes')
	, convert = require('./convert-angle')
	, asin    = require('./asin');

/**
 * Return the arccosine of the given `value`.
 *
 * @param {Double} trigValue
 * @param {Unit} output 
 * @return {Unit}
 * @api public
 */
module.exports = function acos(trigValue, output) {
	var output = typeof output !== 'undefined' ? output : 'deg';
	var convertedValue = convert(Math.PI / 2, output) - asin(trigValue, output).val;
	var m = Math.pow(10, 9);
	convertedValue = Math.round(convertedValue * m) / m;
  return new nodes.Unit(convertedValue, output);
};
