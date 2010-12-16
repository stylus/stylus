
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
  this.r = clamp(r);
  this.g = clamp(g);
  this.b = clamp(b);
  this.a = clampAlpha(a);
};

/**
 * Inherit from `Node.prototype`.
 */

Color.prototype.__proto__ = Node.prototype;

/**
 * Return #nnn or rgba(n,n,n,n) string representation of the color.
 *
 * @return {String}
 * @api public
 */

Color.prototype.toString = function(){
  function pad(n) { return n < 10 ? '0' + n : n.toString(16); }

  if (1 == this.a) {
    return '#' + pad(this.r) + pad(this.g) + pad(this.b);
  } else {
    return 'rgba('
      + this.r + ','
      + this.g + ','
      + this.b + ','
      + this.a + ')';
  }
};

/**
 * Clamp `n` >= 0 and <= 255.
 *
 * @param {Number} n
 * @return {Number}
 * @api private
 */

function clamp(n) {
  return Math.max(0, Math.min(n ,255));
}

/**
 * Clamp alpha `n` >= 0 and <= 1.
 *
 * @param {Number} n
 * @return {Number}
 * @api private
 */

function clampAlpha(n) {
  return Math.max(0, Math.min(n, 1));
}
