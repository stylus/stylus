var nodes = require('../nodes')
  , convert = require('./convert-angle');

/**
 * Return the arctangent of the given `value`.
 *
 * @param {Double} trigValue
 * @param {Unit} output 
 * @return {Unit}
 * @api public
 */

module.exports = function atan(trigValue, output) {
	var output = typeof output !== 'undefined' ? output : 'deg';
	var value = Math.atan(trigValue) ;
	var m = Math.pow(10, 9);
	var convertedValue = convert(value, output);
	convertedValue = Math.round(convertedValue * m) / m;
  return new nodes.Unit(convertedValue, output);
};
