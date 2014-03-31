
/*!
 * Stylus - Member
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Member` with `left` and `right`.
 *
 * @param {Node} left
 * @param {Node} right
 * @api public
 */

var Member = module.exports = function Member(left, right){
  Node.call(this);
  this.left = left;
  this.right = right;
};

/**
 * Inherit from `Node.prototype`.
 */

Member.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 *
 * @return {Node}
 * @api public
 */

Member.prototype.clone = function(){
  var clone = new Member(this.left.clone(), this.right.clone());
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  if (this.val) clone.val = this.val.clone();
  return clone;
};

/**
 * Return a string representation of this node.
 *
 * @return {String}
 * @api public
 */

Member.prototype.toString = function(){
  return this.left.toString()
    + '.' + this.right.toString();
};
