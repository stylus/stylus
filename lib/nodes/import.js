
/*!
 * Stylus - Import
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Import` with the given `expr`.
 *
 * @param {Expression} expr
 * @api public
 */

var Import = module.exports = function Import(expr){
  Node.call(this);
  this.path = expr;
};

/**
 * Inherit from `Node.prototype`.
 */

Import.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 *
 * @return {Node}
 * @api public
 */

Import.prototype.clone = function(){
  var clone = new Import(this.path.clone());
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  return clone;
};
