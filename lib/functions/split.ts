import utils = require('../utils');
import nodes = require('../nodes');

/**
 * Splits the given `val` by `delim`
 *
 * @param {StringNode} delim
 * @param {StringNode|Ident} val
 * @return {Expression}
 * @api public
 */

export function split(delim, val){
  utils.assertString(delim, 'delimiter');
  utils.assertString(val, 'val');
  var splitted = val.string.split(delim.string);
  var expr = new nodes.Expression();
  var ItemNode = val instanceof nodes.Ident
    ? nodes.Ident
    : nodes.StringNode;
  for (var i = 0, len = splitted.length; i < len; ++i) {
    expr.nodes.push(new ItemNode(splitted[i]));
  }
  return expr;
}
