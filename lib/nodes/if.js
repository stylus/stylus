
/*!
 * CSS - If
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `If` with the given `cond`, `ifBlock` and `elseBlock`.
 *
 * @param {Expression} cond
 * @param {Block} ifBlock
 * @param {Block} elseBlock
 * @api public
 */

var If = module.exports = function If(cond, ifBlock, elseBlock){
  Node.call(this);
  this.cond = cond;
  this.ifBlock = ifBlock;
  this.elseBlock = elseBlock;
};

/**
 * Inherit from `Node.prototype`.
 */

If.prototype.__proto__ = Node.prototype;
