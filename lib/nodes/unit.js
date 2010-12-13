
/*!
 * CSS - Unit
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Unit` with the given `val` and unit `type`
 * such as "px", "pt", "in", etc.
 *
 * @param {String} val
 * @param {String} type
 * @api public
 */

var Unit = module.exports = function Unit(val, type){
  this.val = val;
  this.type = type;
};

/**
 * Inherit from `Node.prototype`.
 */

Unit.prototype.__proto__ = Node.prototype;

/**
 * Custom inspect.
 *
 * @return {String}
 * @api public
 */

Unit.prototype.inspect = function(){
  return '[Unit '
    + '\x1b[32m' + this.val + '\x1b[0m'
    + '\x1b[33m' + this.type + '\x1b[0m'
    + ']';
};
