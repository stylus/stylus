/*!
 * Stylus - @block
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `@block` node.
 *
 * @api public
 */

var Atblock = module.exports = function Atblock(){
  Node.call(this);
};

/**
 * Return `block` nodes.
 */

Atblock.prototype.__defineGetter__('nodes', function(){
  return this.block.nodes;
});

/**
 * Inherit from `Node.prototype`.
 */

Atblock.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 *
 * @return {Node}
 * @api public
 */

Atblock.prototype.clone = function(){
  var clone = new Atblock;
  clone.block = this.block.clone();
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return @block.
 *
 * @return {String}
 * @api public
 */

Atblock.prototype.toString = function(){
  return '@block';
};
