
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

var Block = module.exports = function Block(parent, node){
  Node.call(this);
  this.nodes = [];
  this.parent = parent;
  this.node = node;
};

/**
 * Inherit from `Node.prototype`.
 */

Block.prototype.__proto__ = Node.prototype;

/**
 * Check if the block is empty.
 *
 * @return {Boolean}
 * @api public
 */

Block.prototype.__defineGetter__('isEmpty', function(){
  return !this.nodes.length;
});

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Block.prototype.clone = function(){
  var clone = new Block(this.parent, this.node);
  for (var i = 0; i < this.nodes.length; ++i) {
    clone.push(this.nodes[i].clone());
  }
  return clone;
};

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
