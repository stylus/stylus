
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
 * @param {Color|Unit} h
 * @param {Unit} s
 * @param {Unit} l
 * @param {Unit} a
 * @return {Color|HSLA}
 * @api public
 */

exports.hsla = function(h,s,l,a){
  utils.assertType(h, nodes.Unit);
  utils.assertType(s, nodes.Unit);
  utils.assertType(l, nodes.Unit);
  utils.assertType(a, nodes.Unit);
  return new nodes.HSLA(h,s,l,a).rgba;
};

/**
 * Convert the given `color` to an `HSLA` node,
 * or h,s,l to a `Color`.
 *
 * @param {Color|Unit} h
 * @param {Unit} s
 * @param {Unit} l
 * @return {Color|HSLA}
 * @api public
 */

exports.hsl = function(color){
  if (arguments.length > 1) {
    return exports.hsla(
        arguments[0]
      , arguments[1]
      , arguments[2]
      , new nodes.Unit(1));
  }
  utils.assertType(color, nodes.Color);
  return color.hsl;
};

/**
 * Return the hue of the given `hsla`.
 *
 * @param {HSLA} hsla
 * @return {Unit}
 * @api public
 */

exports.hue = function(hsla){
  utils.assertType(hsla, nodes.HSLA);
  return new nodes.Unit(Math.round(hsla.h));
};

/**
 * Return the saturation of the given `hsla`.
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
 * @param {Color} color
 * @return {Unit}
 * @api public
 */

exports.alpha = function(color){
  utils.assertType(color, nodes.Color);
  return new nodes.Unit(color.a);
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
 * @param {Unit} r
 * @param {Unit} g
 * @param {Unit} b
 * @param {Unit} a
 * @return {Color}
 * @api public
 */

exports.rgba = function(r,g,b,a){
  utils.assertType(r, nodes.Unit);
  utils.assertType(g, nodes.Unit);
  utils.assertType(b, nodes.Unit);
  utils.assertType(a, nodes.Unit);
  return new nodes.Color(
      r.val
    , g.val
    , b.val
    , a.val);
};

/**
 * Return a `Color` from the r,g,b channels.
 *
 * @param {Unit} r
 * @param {Unit} g
 * @param {Unit} b
 * @return {Color}
 * @api public
 */

exports.rgb = function(r,g,b){
  var a = new nodes.Unit(1);
  return exports.rgba(r,g,b,a);
};