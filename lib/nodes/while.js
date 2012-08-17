
/*!
 * Stylus - While
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `While` with the given `cond`.
 *
 * @param {Expression} cond
 * @param {Boolean|Block} negate, block
 * @api public
 */

var While = module.exports = function While(cond, block){
  Node.call(this);
  this.cond = cond;
  this.block = block;
};

/**
 * Inherit from `Node.prototype`.
 */

While.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 *
 * @return {Node}
 * @api public
 */

While.prototype.clone = function(){
  var clone = new While(
      this.cond.clone()
    , this.block.clone());
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  return clone;
};