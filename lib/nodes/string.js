
/*!
 * CSS - String
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

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
