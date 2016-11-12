import utils = require('../utils');

/**
 * Throw an error with the given `msg`.
 *
 * @param {StringNode} msg
 * @api public
 */

export function error(msg){
  utils.assertType(msg, 'string', 'msg');
  var err: any = new Error(msg.val);
  err.fromStylus = true;
  throw err;
}
