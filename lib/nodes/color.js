
/*!
 * CSS - Color
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Color` with the given r,g,b,a component values.
 *
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @param {Number} a
 * @api public
 */

var Color = module.exports = function Color(r,g,b,a){
  this.r = r;
  this.g = g;
  this.b = b;
  this.a = a;
};

/**
 * Inherit from `Node.prototype`.
 */

Color.prototype.__proto__ = Node.prototype;
