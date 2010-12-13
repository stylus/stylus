
/*!
 * CSS - Keyword
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Keyword` with the given `val`.
 *
 * @param {String} val
 * @api public
 */

var Keyword = module.exports = function Keyword(val){
  this.val = val;
};

/**
 * Inherit from `Node.prototype`.
 */

Keyword.prototype.__proto__ = Node.prototype;
