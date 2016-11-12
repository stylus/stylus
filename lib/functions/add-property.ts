import utils = require('../utils');
import nodes = require('../nodes');
import {Expression} from '../nodes/expression';

/**
 * Add property `name` with the given `expr`
 * to the mixin-able block.
 *
 * @param {StringNode|Ident|Literal} name
 * @param {Expression} expr
 * @return {Property}
 * @api public
 */

export class addProperty {
  private closestBlock;
  constructor(name, expr: Expression){
  utils.assertType(name, 'expression', 'name');
  name = utils.unwrap(name).first;
  utils.assertString(name, 'name');
  utils.assertType(expr, 'expression', 'expr');
  var prop = new nodes.Property([name], expr);
  var block = this.closestBlock;

  var len = block.nodes.length
    , head = block.nodes.slice(0, block.index)
    , tail = block.nodes.slice(block.index++, len);
  head.push(prop);
  block.nodes = head.concat(tail);

  return <any>prop;
}

  static raw = true;
}
