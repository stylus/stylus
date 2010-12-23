
/*!
 * CSS - Color
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , HSLA = require('./hsla');

/**
 * Initialize a new `Color` with the given r,g,b,a component values.
 *
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @param {Number} a
 * @api public
 */

var Color = exports = module.exports = function Color(r,g,b,a){
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
 * Return `HSLA` representation.
 *
 * @return {HSLA}
 * @api public
 */

Color.prototype.__defineGetter__('hsl', function(){
  return HSLA.fromColor(this);
});

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
 * Return a `Color` from the given `hsla`.
 *
 * @param {HSLA} hsla
 * @return {Color}
 * @api public
 */

exports.fromHSLA = function(hsla){
  var h = hsla.h
    , s = hsla.s
    , l = hsla.l
    , a = hsla.a;

  h = h.val / 360;
  s = s.val / 100;
  l = l.val / 100;

  var m2 = l <= .5 ? l * (s + 1) : l + s - l * s
    , m1 = l * 2 - m2;

  var r = hue(h + 1/3) * 0xff
    , g = hue(h) * 0xff
    , b = hue(h - 1/3) * 0xff;

  function hue(h) {
    if (h < 0) ++h;
    if (h > 1) --h;
    if (h * 6 < 1) return m1 + (m2 - m1) * h * 6;
    if (h * 2 < 1) return m2;
    if (h * 3 < 2) return m1 + (m2 - m1) * (2/3 - h) * 6;
    return m1;
  }
  
  return new Color(r,g,b,a);
};

/**
 * Clamp `n` >= 0 and <= 255.
 *
 * @param {Number} n
 * @return {Number}
 * @api private
 */

function clamp(n) {
  return Math.max(0, Math.min(n.toFixed(0), 255));
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
