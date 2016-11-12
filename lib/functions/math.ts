import utils = require('../utils');
import nodes = require('../nodes');

/**
 * Apply Math `fn` to `n`.
 *
 * @param {Unit} n
 * @param {StringNode} fn
 * @return {Unit}
 * @api private
 */

export function math(n, fn){
  utils.assertType(n, 'unit', 'n');
  utils.assertString(fn, 'fn');
  return new nodes.Unit(Math[fn.string](n.val), n.type);
}
