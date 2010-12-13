
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
  this.val = val;
  this.block = block || new Block;
};

/**
 * Inherit from `Node.prototype`.
 */

Selector.prototype.__proto__ = Node.prototype;

/**
 * Custom inspect.
 *
 * @return {String}
 * @api public
 */

Selector.prototype.inspect = function(){
  return '[Selector '
    + '\x1b[33m' + this.val + '\x1b[0m'
    + ' ' + this.block.inspect()
    + ']';
};
