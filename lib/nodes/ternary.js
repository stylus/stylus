
/*!
 * CSS - Ternary
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Ternary` with `cond`, `trueExpr` and `falseExpr`.
 *
 * @param {Expression} cond
 * @param {Expression} trueExpr
 * @param {Expression} falseExpr
 * @api public
 */

var Ternary = module.exports = function Ternary(cond, trueExpr, falseExpr){
  this.cond = cond;
  this.trueExpr = trueExpr;
  this.falseExpr = falseExpr;
};

/**
 * Inherit from `Node.prototype`.
 */

Ternary.prototype.__proto__ = Node.prototype;