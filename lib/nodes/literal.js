
/*!
 * CSS - Literal
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('./');

/**
 * Initialize a new `Literal` with the given `str`.
 *
 * @param {String} str
 * @api public
 */

var Literal = module.exports = function Literal(str){
  Node.call(this);
  this.val = str;
};

/**
 * Inherit from `Node.prototype`.
 */

Literal.prototype.__proto__ = Node.prototype;

/**
 * Return @<name>.
 *
 * @return {String}
 * @api public
 */

Literal.prototype.toString = function(){
  return 'css "' + this.val + '"';
};
