
/*!
 * Stylus - Null
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('./');

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

Null.prototype.inspect = 
Null.prototype.toString = function(){
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

/**
 * Return hash.
 *
 * @return {String}
 * @api public
 */

Null.prototype.__defineGetter__('hash', function(){
  return null;
});