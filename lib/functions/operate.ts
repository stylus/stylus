import utils = require('../utils');

/**
 * Perform `op` on the `left` and `right` operands.
 *
 * @param {StringNode} op
 * @param {Node} left
 * @param {Node} right
 * @return {Node}
 * @api public
 */

export function operate(op, left, right){
  utils.assertType(op, 'string', 'op');
  utils.assertPresent(left, 'left');
  utils.assertPresent(right, 'right');
  return left.operate(op.val, right);
}
