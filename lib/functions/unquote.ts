import utils = require('../utils');
import nodes = require('../nodes');

/**
 * Unquote the given `string`.
 *
 * Examples:
 *
 *    unquote("sans-serif")
 *    // => sans-serif
 *
 *    unquote(sans-serif)
 *    // => sans-serif
 *
 * @param {StringNode|Ident} string
 * @return {Literal}
 * @api public
 */

export function unquote(string){
  utils.assertString(string, 'string');
  return new nodes.Literal(string.string);
};
