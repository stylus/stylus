import utils = require('../utils');
import nodes = require('../nodes');

/**
 * Warn with the given `msg` prefixed by "Warning: ".
 *
 * @param {StringNode} msg
 * @api public
 */

export function warn(msg){
  utils.assertType(msg, 'string', 'msg');
  console.warn('Warning: %s', msg.val);
  return nodes.nullNode;
}
