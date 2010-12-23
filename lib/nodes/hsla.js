
/*!
 * CSS - HSLA
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `HSLA` with the given h,s,l,a component values.
 *
 * @param {Number} h
 * @param {Number} s
 * @param {Number} l
 * @param {Number} a
 * @api public
 */

var HSLA = exports = module.exports = function HSLA(h,s,l,a){
  this.h = h;
  this.s = s;
  this.l = l;
  this.a = clampAlpha(a);
};

/**
 * Inherit from `Node.prototype`.
 */

HSLA.prototype.__proto__ = Node.prototype;

/**
 * Return hsla(n,n,n,n).
 *
 * @return {String}
 * @api public
 */

HSLA.prototype.toString = function(){
  return 'hsla('
    + this.h + ','
    + this.l + ','
    + this.s + ','
    + this.a + ')';
};

/**
 * Return `HSLA` representation of the given `color`.
 *
 * @param {Color} color
 * @return {HSLA}
 * @api public
 */

exports.fromColor = function(color){
  var r = color.r / 255
    , g = color.g / 255
    , b = color.b / 255
    , a = color.a;
  
  var min = Math.min(r,g,b)
    , max = Math.max(r,g,b)
    , h, s
    , l = (max + min) / 2
    , d = max - min;

  if (min == max) {
    h = s = 0;
  } else {
    s = l > .5
      ? d / (2 - max - min)
      : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  h *= 360;

  return new HSLA(h,s,l,a);
};

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
