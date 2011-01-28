
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
 * Initialize a new `Property` with the given `segs` and optional `expr`.
 *
 * @param {Array} segs
 * @param {Expression} expr
 * @api public
 */

var Property = module.exports = function Property(segs, expr){
  Node.call(this);
  this.segments = segs;
  this.expr = expr;
};

/**
 * Inherit from `Node.prototype`.
 */

Property.prototype.__proto__ = Node.prototype;

Property.prototype.__defineGetter__('name', function(){
  return this.segments.join(' ');
});

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Property.prototype.clone = function(){
  var clone = new Property(this.name);
  clone.lineno = this.lineno;
  if (this.expr) clone.expr = this.expr.clone();
  return clone;
};
