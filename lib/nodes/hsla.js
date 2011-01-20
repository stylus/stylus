
/*!
 * CSS - HSLA
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('./');

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
  Node.call(this);
  this.h = h;
  this.s = s;
  this.l = l;
  this.a = clampAlpha(a);
  this.hsl = this;
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
    + this.s + ','
    + this.l + ','
    + this.a + ')';
};

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

HSLA.prototype.clone = function(){
  var clone = new HSLA(
      this.h
    , this.s
    , this.l
    , this.a);
  clone.lineno = this.lineno;
  return clone;
};

/**
 * Return rgba `Color` representation.
 *
 * @return {Color}
 * @api public
 */

HSLA.prototype.__defineGetter__('rgba', function(){
  return nodes.Color.fromHSLA(this);
});

/**
 * Return hash.
 *
 * @return {String}
 * @api public
 */

HSLA.prototype.__defineGetter__('hash', function(){
  return this.rgba.toString();
});

/**
 * Coerce color to HSLA.
 *
 * @param {Node} other
 * @return {Node}
 * @api public
 */

HSLA.prototype.coerce = function(other){
  if (other instanceof nodes.Color) {
    return other.hsl;
  } else {
    return Node.prototype.coerce.call(this, other);
  }
};

/**
 * Operate on `right` with the given `op`.
 *
 * @param {String} op
 * @param {Node} right
 * @return {Node}
 * @api public
 */

HSLA.prototype.operate = function(op, right){
  return this.rgba.operate(op, right.rgba).hsl;
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

  var h,s,l
    , min = Math.min(r,g,b)
    , max = Math.max(r,g,b)
    , d = max - min;

  switch (max) {
    case min: h = 0; break;
    case r: h = 60 * (g-b) / d; break;
    case g: h = 60 * (b-r) / d + 120; break;
    case g: h = 60 * (r-g) / d + 240; break;
  }
  
  l = (max + min) / 2;

  if (max == min) {
    s = 0;
  } else if (l < .5) {
    s = d / (2 * l);
  } else {
    s = d / (2 - 2 * l);
  }

  h %= 360;
  s *= 100;
  l *= 100;

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
