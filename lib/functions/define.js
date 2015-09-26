var utils = require('../utils')
  , nodes = require('../nodes');

/**
 * Set a variable `name` on current scope.
 *
 * @param {String} name
 * @param {Expression} expr
 * @api public
 */

module.exports = function define(name, expr){
  utils.assertType(name, 'string', 'name');
  expr = utils.unwrap(expr);
  var scope = this.currentScope;
  var node = new nodes.Ident(name.val, expr);
  scope.add(node);
  return nodes.null;
};
