
/*!
 * Stylus - Content
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Content` node with `parent` Block.
 *
 * @param {Block} parent
 * @api public
 */

var Content = module.exports = function Content(parent){
  Node.call(this);
  this.parent = parent;
};

/**
 * Inherit from `Node.prototype`.
 */

Content.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 *
 * @return {Node}
 * @api public
 */

Content.prototype.clone = function(){
  return new Content(this.parent);
};

/**
 * Return @content.
 *
 * @return {String}
 * @api public
 */

Content.prototype.toString = function(){
  return '@content';
};
