
/*!
 * Stylus - Viewport
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Viewport` with the given `block`.
 *
 * @param {Block} block
 * @api public
 */

var Viewport = module.exports = function Viewport(block, prefix){
  Node.call(this);
  this.block = block;
  this.prefix = prefix || 'official';
};

/**
 * Inherit from `Node.prototype`.
 */

Viewport.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Viewport.prototype.clone = function(){
  var clone = new Viewport(this.block.clone());
  clone.lineno = this.lineno;
  clone.prefix = this.prefix;
  return clone;
};

/**
 * Return `@oage name`.
 *
 * @return {String}
 * @api public
 */

Viewport.prototype.toString = function(){
  return '@viewport';
};
