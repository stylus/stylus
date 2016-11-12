import nodes = require('../nodes');

/**
 * Output stack trace.
 *
 * @api public
 */

export function trace(){
  console.log(this.stack);
  return nodes.nullNode;
}
