
/*!
 * CSS - Visitor
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Initialize a new `Visitor` with the given `root` Node.
 *
 * @param {Node} root
 * @api private
 */

var Visitor = module.exports = function Visitor(root) {
  this.root = root;
};

/**
 * Visit the given `node`.
 *
 * @param {Node} node
 * @api public
 */

Visitor.prototype.visit = function(node){
  var method = 'visit' + node.constructor.name;
  if (!this[method]) throw new Error('visitor method ' + method + ' not defined');
  return this[method]();
};

