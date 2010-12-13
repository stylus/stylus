
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
 * Visit the given `node` or an array of nodes.
 *
 * @param {Node|Array} node
 * @api public
 */

Visitor.prototype.visit = function(node, fn){
  if (Array.isArray(node)) {
    for (var i = 0, len = node.length; i < len; ++i) {
      this.visit(node[i]);
      fn && fn(node[i]);
    }
  } else {
    var method = 'visit' + node.constructor.name;
    if (!this[method]) throw new Error('visitor method ' + method + '() not defined');
    return this[method](node);
  }
};

