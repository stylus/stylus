
/*!
 * Stylus - Boolean
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('./');

/**
 * Initialize a new `Boolean` node with the given `val`.
 *
 * @param {Boolean} val
 * @api public
 */

var Boolean = module.exports = function Boolean(val){
  Node.call(this);
  if (this instanceof Boolean) {
    this.val = !!val;
  } else {
    return val ? nodes.true : nodes.false;
  }
};

/**
 * Inherit from `Node.prototype`.
 */

Boolean.prototype.__proto__ = Node.prototype;

/**
 * Return `this` node.
 *
 * @return {Boolean}
 * @api public
 */

Boolean.prototype.toBoolean = function(){
  return this;
};

/**
 * Negate the value.
 *
 * @return {Boolean}
 * @api public
 */

Boolean.prototype.negate = function(){
  return this.val
    ? nodes.false
    : nodes.true;
};

/**
 * Return 'Boolean'.
 *
 * @return {String}
 * @api public
 */

Boolean.prototype.inspect = function(){
  return '[Boolean ' + this.val + ']';
};

/**
 * Return 'true' or 'false'.
 *
 * @return {String}
 * @api public
 */

Boolean.prototype.toString = function(){
  return this.val
    ? 'true'
    : 'false';
};