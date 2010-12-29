
/*!
 * CSS - Selector
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Block = require('./block')
  , Node = require('./node');

/**
 * Initialize a new `Selector` with the given `val` and `block`
 * which defaults to an empty block.
 *
 * @param {String} val
 * @param {Block} block
 * @api public
 */

var Selector = module.exports = function Selector(val, block){
  Node.call(this);
  this.val = val;
  this.block = block || new Block;
};

/**
 * Inherit from `Node.prototype`.
 */

Selector.prototype.__proto__ = Node.prototype;

/**
 * Return the selector string.
 *
 * @return {String}
 * @api public
 */

Selector.prototype.toString = function(){
  return this.val;
};
