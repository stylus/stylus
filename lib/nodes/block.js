
/*!
 * CSS - Block
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Block` node with `parent` Block.
 *
 * @param {Block} parent
 * @api public
 */

var Block = module.exports = function Block(parent){
  this.nodes = [];
  this.parent = parent;
};

/**
 * Inherit from `Node.prototype`.
 */

Block.prototype.__proto__ = Node.prototype;

/**
 * Push a `node` to this block.
 *
 * @param {Node} node
 * @api public
 */

Block.prototype.push = function(node){
  this.nodes.push(node);
};

/**
 * Return parent string.
 *
 * @return {String}
 * @api public
 */

Block.prototype.toString = function(){
  return this.parent.toString();
};
