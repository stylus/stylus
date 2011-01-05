
/*!
 * CSS - Property
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Property` with the given `name`.
 *
 * @param {String} name
 * @api public
 */

var Property = module.exports = function Property(name){
  Node.call(this);
  this.name = name;
};

/**
 * Inherit from `Node.prototype`.
 */

Property.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Property.prototype.clone = function(){
  var clone = new Property(this.name);
  if (this.expr) clone.expr = this.expr.clone();
  return clone;
};
