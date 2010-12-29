
/*!
 * CSS - String
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('./');

/**
 * Initialize a new `String` with the given `val`.
 *
 * @param {String} val
 * @api public
 */

var String = module.exports = function String(val){
  this.val = val;
};

/**
 * Inherit from `Node.prototype`.
 */

String.prototype.__proto__ = Node.prototype;

/**
 * Return hash.
 *
 * @return {Node}
 * @api public
 */

String.prototype.__defineGetter__('hash', function(){
  return this.val;
});

/**
 * Return quoted string.
 *
 * @return {String}
 * @api public
 */

String.prototype.toString = function(){
  return '"' + this.val + '"';
};

/**
 * Return Boolean based on the length of this string.
 *
 * @return {Boolean}
 * @api public
 */

String.prototype.toBoolean = function(){
  return nodes.Boolean(this.val.length);
};