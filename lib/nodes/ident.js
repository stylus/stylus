
/*!
 * CSS - Ident
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Ident` with the given `val`.
 *
 * @param {String} val
 * @api public
 */

var Ident = module.exports = function Ident(val){
  Node.call(this);
  this.val = val;
};

/**
 * Inherit from `Node.prototype`.
 */

Ident.prototype.__proto__ = Node.prototype;

/**
 * Return the keyword string.
 *
 * @return {String}
 * @api public
 */

Ident.prototype.toString = function(){
  return this.val;
};
