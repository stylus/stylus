import nodes = require('../nodes');

/**
 * Get Math `prop`.
 *
 * @param {StringNode} prop
 * @return {Unit}
 * @api private
 */

export = function math(prop){
  return new nodes.Unit(Math[prop.string]);
};
