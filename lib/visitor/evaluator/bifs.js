
/*!
 * CSS - Evaluator - built-in functions
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var nodes = require('../../nodes')
  , utils = require('./utils');

/**
 * Convert the given `color` to an `HSLA` node,
 * or h,s,l,a to a `Color`.
 *
 * Examples:
 *
 *    hsla(10deg, 50%, 30%, 0.5)
 *    // => Color
 *
 *    hsla(#ffcc00)
 *    // => HSLA
 *
 * @param {Color|Unit} h
 * @param {Unit} s
 * @param {Unit} l
 * @param {Unit} a
 * @return {Color|HSLA}
 * @api public
 */

exports.hsla = function(h,s,l,a){
  switch (arguments.length) {
    case 1:
      utils.assertType(h, nodes.Color);
      return h.hsl;
    default:
      utils.assertType(h, nodes.Unit);
      utils.assertType(s, nodes.Unit);
      utils.assertType(l, nodes.Unit);
      utils.assertType(a, nodes.Unit);
      return new nodes.HSLA(h,s,l,a).rgba;
  }
};

/**
 * Convert the given `color` to an `HSLA` node,
 * or h,s,l to a `Color`.
 *
 * Examples:
 *
 *    hsl(10, 50, 30)
 *    // => HSLA
 *
 *    hsl(#ffcc00)
 *    // => HSLA
 *
 * @param {Color|Unit} h
 * @param {Unit} s
 * @param {Unit} l
 * @return {Color|HSLA}
 * @api public
 */

exports.hsl = function(h,s,l){
  if (arguments.length > 1) {
    return exports.hsla(h,s,l,new nodes.Unit(1));
  }
  utils.assertType(h, nodes.Color);
  return h.hsl;
};

/**
 * Return type of `node.`
 *
 * Examples:
 * 
 *    type(12)
 *    // => 'unit'
 *
 *    type(#fff)
 *    // => 'color'
 *
 * @param {Node} node
 * @return {String}
 * @api public
 */

exports.type = function(node){
  return new nodes.String(node.constructor.name.toLowerCase());
};

/**
 * Return the hue of the given `hsla`.
 *
 * Examples:
 *
 *    hue(hsl(50deg, 100%, 80%))
 *    // => 50deg
 *
 * @param {HSLA} hsla
 * @return {Unit}
 * @api public
 */

exports.hue = function(hsla){
  utils.assertType(hsla, nodes.HSLA);
  return new nodes.Unit(Math.round(hsla.h), 'deg');
};

/**
 * Return the saturation of the given `hsla`.
 *
 * Examples:
 *
 *    saturation(hsl(50deg, 100%, 80%))
 *    // => 100%
 *
 * @param {HSLA} hsla
 * @return {Unit}
 * @api public
 */

exports.saturation = function(hsla){
  utils.assertType(hsla, nodes.HSLA);
  return new nodes.Unit(Math.round(hsla.s), '%');
};

/**
 * Return the lightness of the given `hsla`.
 *
 * Examples:
 *
 *    lightness(hsl(50def, 100%, 80%))
 *    // => 80%
 *
 * @param {HSLA} hsla
 * @return {Unit}
 * @api public
 */

exports.lightness = function(hsla){
  utils.assertType(hsla, nodes.HSLA);
  return new nodes.Unit(Math.round(hsla.l), '%');
};

/**
 * Return the alpha component of the given `color`.
 *
 * Examples:
 *
 *   alpha(#fff)
 *   // => 1
 *
 *   alpha(rgba(0,0,0,0.3))
 *   // => 0.3
 *
 * @param {Color|HSLA} color
 * @return {Unit}
 * @api public
 */

exports.alpha = function(color){
  if (color instanceof nodes.Color ||
      color instanceof nodes.HSLA) {
    return new nodes.Unit(color.a);
  }
  utils.assertType(color, nodes.Color);
};

/**
 * Return the red component of the given `color`.
 *
 * @param {Color} color
 * @return {Unit}
 * @api public
 */

exports.red = function(color){
  utils.assertType(color, nodes.Color);
  return new nodes.Unit(color.r);
};

/**
 * Return the green component of the given `color`.
 *
 * @param {Color} color
 * @return {Unit}
 * @api public
 */

exports.green = function(color){
  utils.assertType(color, nodes.Color);
  return new nodes.Unit(color.g);
};

/**
 * Return the blue component of the given `color`.
 *
 * @param {Color} color
 * @return {Unit}
 * @api public
 */

exports.blue = function(color){
  utils.assertType(color, nodes.Color);
  return new nodes.Unit(color.b);
};

/**
 * Return a `Color` from the r,g,b,a channels.
 *
 * @param {Unit|Color} r
 * @param {Unit} g
 * @param {Unit} b
 * @param {Unit} a
 * @return {Color}
 * @api public
 */

exports.rgba = function(r,g,b,a){
  switch (arguments.length) {
    case 1:
      utils.assertType(r, nodes.Color);
      return new nodes.Color(
          r.r
        , r.g
        , r.b
        , r.a);
    case 2:
      utils.assertType(r, nodes.Color);
      utils.assertType(g, nodes.Unit);
      return new nodes.Color(
          r.r
        , r.g
        , r.b
        , g.val);
    default:
      utils.assertType(r, nodes.Unit);
      utils.assertType(g, nodes.Unit);
      utils.assertType(b, nodes.Unit);
      utils.assertType(a, nodes.Unit);
      return new nodes.Color(
          r.val
        , g.val
        , b.val
        , a.val);
  }
};

/**
 * Return a `Color` from the r,g,b channels.
 *
 * @param {Unit|Color} r
 * @param {Unit} g
 * @param {Unit} b
 * @return {Color}
 * @api public
 */

exports.rgb = function(r,g,b){
  switch (arguments.length) {
    case 1:
      utils.assertType(r, nodes.Color);
      return new nodes.Color(
          r.r
        , r.g
        , r.b
        , 1);
    default:
      return exports.rgba(r,g,b,new nodes.Unit(1));
  }
};