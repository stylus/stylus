
/*!
 * Stylus - Comment
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Comment` with the given `str`.
 *
 * @param {String} str
 * @api public
 */

var Comment = module.exports = function Comment(str){
  Node.call(this);
  this.str = str;
};

/**
 * Inherit from `Node.prototype`.
 */

Comment.prototype.__proto__ = Node.prototype;
