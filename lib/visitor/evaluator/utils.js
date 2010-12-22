
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