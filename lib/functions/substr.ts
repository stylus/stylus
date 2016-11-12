import utils = require('../utils');
import nodes = require('../nodes');

/**
 * Returns substring of the given `val`.
 *
 * @param {StringNode|Ident} val
 * @param {Number} start
 * @param {Number} [length]
 * @return {StringNode|Ident}
 * @api public
 */

export function substr(val, start, length){
  utils.assertString(val, 'val');
  utils.assertType(start, 'unit', 'start');
  length = length && length.val;
  var res = val.string.substr(start.val, length);
  return val instanceof nodes.Ident
      ? new nodes.Ident(res)
      : new nodes.StringNode(res);
}
