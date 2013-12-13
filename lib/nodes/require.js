
/*!
 * Stylus - Require
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Import = require('./import');

/**
 * Initialize a new `Require` with the given `expr`.
 *
 * @param {Expression} expr
 * @api public
 */

var Require = module.exports = function Require(expr){
  Import.call(this, expr);
};

/**
 * Inherit from `Import.prototype`.
 */

Require.prototype.__proto__ = Import.prototype;

/**
 * Return a clone of this node.
 *
 * @return {Node}
 * @api public
 */

Require.prototype.clone = function(){
  var clone = new Require(this.path.clone());
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  return clone;
};
