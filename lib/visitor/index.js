
/*!
 * Stylus - Visitor
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
 * If `fn` is not set, the object is expected to have only
 * synchron visit-methods. If `fn` is set, synchron and
 * asynchron visit-methods are supported.
 *
 * @param {Node|Array} node
 * @param {Function} fn
 * @api public
 */

Visitor.prototype.visit = function(node, fn){
  var method = 'visit' + node.constructor.name;
  try {
    if (this[method]) {
      if(fn && this[method].length === 1)
        return fn(null, this[method](node));
      // if(this[method].length >= 2 && !fn)
        // throw new Error("try to visit a asynchron method in synchron style");
      return this[method](node, fn);
    }
    if(fn) return fn(null, node);
    return node;
  } catch(err) {
    if(fn) return fn(err);
    throw err;
  }
};

