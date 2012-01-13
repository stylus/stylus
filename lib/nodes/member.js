
/*!
 * Stylus - Member
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var BinOp = require('./binop');

/**
 * Initialize a new `Member` with `left` and `right`.
 *
 * @param {Node} left
 * @param {Node} right
 * @api public
 */

var Member = module.exports = function Member(left, right){
  BinOp.call(this, '.', left, right);
};

/**
 * Inherit from `BinOp.prototype`.
 */

Member.prototype.__proto__ = BinOp.prototype;

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
