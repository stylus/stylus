import utils = require('../utils');
import nodes = require('../nodes');

/**
 * Lookup variable `name` or return Null.
 *
 * @param {StringNode} name
 * @return {Mixed}
 * @api public
 */

export function lookup(name){
  utils.assertType(name, 'string', 'name');
  var node = this.lookup(name.val);
  if (!node) return nodes.nullNode;
  return this.visit(node);
}
