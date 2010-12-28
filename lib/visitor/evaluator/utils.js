
/*!
 * CSS - Evaluator - utils
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var nodes = require('../../nodes');

/**
 * Assert that `node` is of the given `type`, or throw.
 *
 * @param {Node} node
 * @param {Function} type
 * @param {String} msg
 * @api public
 */

exports.assertType = function(node, type, msg){
  if (node instanceof type) return;
  var actual = node.constructor.name;
  msg = msg || 'expected ' + type.name + ', but got ' + actual + ':' + node;
  throw new Error('TypeError: ' + msg);
};

/**
 * Assert that `node` is a `Color` or `HSLA`.
 *
 * @param {Node} node
 * @param {String} msg
 * @api public
 */

exports.assertColor = function(node, msg){
  if (node instanceof nodes.Color) return;
  if (node instanceof nodes.HSLA) return;
  var actual = node.constructor.name;
  msg = msg || 'expected Color or HSLA, but got ' + actual + ':' + node;
  throw new Error('TypeError: ' + msg);
};

/**
 * Coerce `node` into a `Color` or throw.
 *
 * @param {Node} node
 * @return {Color}
 * @api public
 */

exports.toColor = function(node) {
  if (node instanceof nodes.Color) return node;
  if (node instanceof nodes.Unit) {
    var n = node.val;
    return new nodes.Color(n,n,n,1);
  }
  throw new Error('unable to coerce ' + node + ' into a Color');
};

/**
 * Coerce unit `b` to the same type as `a`.
 *
 * Supports:
 *
 *    mm -> cm | in
 *    cm -> mm | in
 *    in -> mm | cm
 *
 * @param {Unit} a
 * @param {Unit} b
 * @return {Unit}
 * @api public
 */

exports.coerce = function(a, b){
  switch (a.type) {
    case 'mm':
      switch (b.type) {
        case 'cm':
          return new nodes.Unit(b.val * 2.54, 'mm');
        case 'in':
          return new nodes.Unit(b.val * 25.4, 'mm');
      }
    case 'cm':
      switch (b.type) {
        case 'mm':
          return new nodes.Unit(b.val / 10, 'cm');
        case 'in':
          return new nodes.Unit(b.val * 2.54, 'cm');
      }
    case 'in':
      switch (b.type) {
        case 'mm':
          return new nodes.Unit(b.val / 25.4, 'in');
        case 'cm':
          return new nodes.Unit(b.val / 2.54, 'in');
      }
  }
  return new nodes.Unit(b.val, a.type);
};