
/*!
 * CSS - Selector
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Block = require('./block')
  , Node = require('./node');

/**
 * Initialize a new `Selector` with the given `val`.
 *
 * @param {String} val
 * @param {Boolean} parent
 * @api public
 */

var Selector = module.exports = function Selector(val, parent){
  Node.call(this);
  this.val = val.replace(/ +$/, '');
  this.parent = parent;
};

/**
 * Inherit from `Node.prototype`.
 */

Selector.prototype.__proto__ = Node.prototype;

/**
 * Return the selector string.
 *
 * @return {String}
 * @api public
 */

Selector.prototype.toString = function(){
  return this.val;
};

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Selector.prototype.clone = function(){
  var clone = new Selector(this.val, this.parent);
  clone.lineno = this.lineno;
  return clone;
};
