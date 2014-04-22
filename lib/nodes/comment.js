
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
 * @param {Boolean} suppress
 * @api public
 */

var Comment = module.exports = function Comment(str, suppress){
  Node.call(this);
  this.str = str;
  this.suppress = suppress;
};

/**
 * Inherit from `Node.prototype`.
 */

Comment.prototype.__proto__ = Node.prototype;

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Comment.prototype.toJSON = function(){
  return {
    __type: 'Comment',
    str: this.str,
    suppress: this.suppress,
    lineno: this.lineno,
    filename: this.filename
  };
};

/**
 * Return comment.
 *
 * @return {String}
 * @api public
 */

Comment.prototype.toString = function(){
  return this.str;
};
