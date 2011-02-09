
/*!
 * CSS - Color
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , HSLA = require('./hsla')
  , nodes = require('./');

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
  Node.call(this);
  this.r = clamp(r);
  this.g = clamp(g);
  this.b = clamp(b);
  this.a = clampAlpha(a);
  this.rgba = this;
};

/**
 * Inherit from `Node.prototype`.
 */

Color.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Color.prototype.clone = function(){
  var clone = new Color(
      this.r
    , this.g
    , this.b
    , this.a);
  clone.lineno = this.lineno;
  return clone;
};

/**
 * Return true.
 *
 * @return {Boolean}
 * @api public
 */

Color.prototype.toBoolean = function(){
  return nodes.true;
};

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
 * Return hash.
 *
 * @return {String}
 * @api public
 */

Color.prototype.__defineGetter__('hash', function(){
  return this.toString();
});

/**
 * Coerce HSLA and Unit to color.
 *
 * @param {Node} other
 * @return {Node}
 * @api public
 */

Color.prototype.coerce = function(other){
  if (other instanceof nodes.HSLA) {
    return other.rgba;
  } else if (other instanceof nodes.Unit) {
    var n = other.val;
    return new Color(n,n,n,1);
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

Color.prototype.operate = function(op, right){
  switch (op) {
    case '+':
      return new Color(
          this.r + right.r
        , this.g + right.g
        , this.b + right.b
        , 1 == right.a ? this.a : (this.a + right.a)
        );
    case '-':
      return new Color(
          this.r - right.r
        , this.g - right.g
        , this.b - right.b
        , 1 == right.a ? this.a : (this.a - right.a)
        );
    case '*':
      return new Color(
          this.r * right.r
        , this.g * right.g
        , this.b * right.b
        , this.a * right.a
        );
    case '/':
      return new Color(
          this.r / right.r
        , this.g / right.g
        , this.b / right.b
        , this.a / right.a
        );
    default:
      return Node.prototype.operate.call(this, op, right);
  }
};

/**
 * Return #nnnnnn, #nnn, or rgba(n,n,n,n) string representation of the color.
 *
 * @return {String}
 * @api public
 */

Color.prototype.toString = function(){
  function pad(n) {
    return n < 16
      ? '0' + n.toString(16)
      : n.toString(16);
  }

  if (1 == this.a) {
    var r = pad(this.r)
      , g = pad(this.g)
      , b = pad(this.b);

    // Compress
    if (r[0] == r[1] && g[0] == g[1] && b[0] == b[1]) {
      return '#' + r[0] + g[0] + b[0];
    } else {
      return '#' + r + g + b;
    }
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
  var h = hsla.h / 360
    , s = hsla.s / 100
    , l = hsla.l / 100
    , a = hsla.a;

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
