
/*!
 * CSS - Unit
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('./');

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
 * Return Boolean based on the unit value.
 *
 * @return {Boolean}
 * @api public
 */

Node.prototype.toBoolean = function(){
  return nodes.Boolean(this.val);
};

/**
 * Return unit string.
 *
 * @return {String}
 * @api public
 */

Unit.prototype.toString = function(){
  var n = this.val;
  if ('px' == this.type) n = n.toFixed(0);
  return n + (this.type || '');
};
