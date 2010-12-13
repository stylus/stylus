
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
 * Initialize a new `Block` node.
 *
 * @api public
 */

var Block = module.exports = function Block(){
  this.nodes = [];
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
