
/*!
 * Stylus - Keyframes
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Keyframes` with the given `name`,
 * and optional vendor `prefix`.
 *
 * @param {String} name
 * @param {String} prefix
 * @api public
 */

var Keyframes = module.exports = function Keyframes(name, prefix){
  Node.call(this);
  this.name = name;
  this.prefix = prefix || 'official';
};

/**
 * Inherit from `Node.prototype`.
 */

Keyframes.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Keyframes.prototype.clone = function(){
  var clone = new Keyframes(this.name);
  clone.lineno = this.lineno;
  clone.prefix = this.prefix;
  clone.block = this.block.clone();
  return clone;
};

/**
 * Return `@keyframes name`.
 *
 * @return {String}
 * @api public
 */

Keyframes.prototype.toString = function(){
  return '@keyframes ' + this.name;
};
