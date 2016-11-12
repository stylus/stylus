import utils = require('../utils');

/**
 * Like `unquote` but tries to convert
 * the given `str` to a Stylus node.
 *
 * @param {StringNode} str
 * @return {Node}
 * @api public
 */

export function convert(str){
  utils.assertString(str, 'str');
  return utils.parseString(str.string);
}
