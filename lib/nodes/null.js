
/*!
 * CSS - Null
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Null` node.
 *
 * @api public
 */

var Null = module.exports = function Null(){};

/**
 * Inherit from `Node.prototype`.
 */

Null.prototype.__proto__ = Node.prototype;

/**
 * Return 'Null'.
 *
 * @return {String}
 * @api public
 */

Null.prototype.inspect = function(){
  return '[Null]';
};

/**
 * Return false.
 *
 * @return {Boolean}
 * @api public
 */

Null.prototype.toBoolean = function(){
  return nodes.false;
};