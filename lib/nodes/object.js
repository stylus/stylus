
/*!
 * Stylus - Object
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('./');

/**
 * Initialize a new `Object`.
 *
 * @api public
 */

var Object = module.exports = function Object(){
  Node.call(this);
  this.vals = {};
};

/**
 * Inherit from `Node.prototype`.
 */

Object.prototype.__proto__ = Node.prototype;

/**
 * Set `key` to `val`.
 *
 * @param {String} key
 * @param {Node} val
 * @return {Object} for chaining
 * @api public
 */

Object.prototype.set = function(key, val){
  this.vals[key] = val;
  return this;
};

/**
 * Get `key`.
 *
 * @param {String} key
 * @return {Node}
 * @api public
 */

Object.prototype.get = function(key){
  return this.vals[key] || nodes.null;
};

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Object.prototype.clone = function(){
  var clone = new Object;
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  for (var key in this.vals) {
    clone.vals[key] = this.vals[key].clone();
  }
  return clone;
};

