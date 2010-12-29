
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
 * @param {String} param
 * @api public
 */

exports.assertType = function(node, type, param){
  exports.assertPresent(node, param);
  if (node instanceof type) return;
  var actual = node.constructor.name
    , msg = 'expected ' + type.name + ', but got ' + actual + ':' + node;
  throw new Error('TypeError: ' + msg);
};

/**
 * Assert that `node` is a `Color` or `HSLA`.
 *
 * @param {Node} node
 * @param {String} param
 * @api public
 */

exports.assertColor = function(node, param){
  exports.assertPresent(node, param);
  if (node instanceof nodes.Color) return;
  if (node instanceof nodes.HSLA) return;
  var actual = node.constructor.name;
  msg = msg || 'expected Color or HSLA, but got ' + actual + ':' + node;
  throw new Error('TypeError: ' + msg);
};

/**
 * Assert that param `name` is given, aka the `node` is passed.
 *
 * @param {Node} node
 * @param {String} name
 * @api public
 */

exports.assertPresent = function(node, name){
  if (node) return;
  if (name) throw new Error('ArgumentError: argument ' + name + ' required');
  throw new Error('ArgumentError: argument missing');
}