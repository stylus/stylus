
/*!
 * CSS - Evaluator - operations
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var nodes = require('../../nodes');

/**
 * Global operations.
 */

exports.all = {
  'is a': function(left, right){
    return right.val == left.constructor.name
      ? nodes.true
      : nodes.false;
  }
};

/**
 * Unit operations.
 */

exports.unit = {
  '+': function(left, right){
    return new nodes.Unit(left.val + right.val, left.type || right.type);
  },

  '-': function(left, right){
    return new nodes.Unit(left.val - right.val, left.type || right.type);
  },

  '/': function(left, right){
    return new nodes.Unit(left.val / right.val, left.type || right.type);
  },

  '*': function(left, right){
    return new nodes.Unit(left.val * right.val, left.type || right.type);
  }  
};

/**
 * String operations.
 */

exports.string = {
  '+': function(left, right){
    return new nodes.String(left.val + right.val);
  }  
};

/**
 * Color operations.
 */

exports.color = {
  '+': function(left, right){
    right = toColor(right);
    return new nodes.Color(
        left.r + right.r
      , left.g + right.g
      , left.b + right.b
      , left.a + right.a
      );
  },
  
  '-': function(left, right){
    right = toColor(right);
    return new nodes.Color(
        left.r - right.r
      , left.g - right.g
      , left.b - right.b
      , 1 == right.a ? left.a : (left.a - right.a)
      );
  },
  
  '*': function(left, right){
    right = toColor(right);
    return new nodes.Color(
        left.r * right.r
      , left.g * right.g
      , left.b * right.b
      , left.a * right.a
      );      
  },
  
  '/': function(left, right){
    right = toColor(right);
    return new nodes.Color(
        left.r / right.r
      , left.g / right.g
      , left.b / right.b
      , left.a / right.a
      );      
  }
};

/**
 * Coerce `node` into a `Color` or throw.
 *
 * @param {Node} node
 * @return {Color}
 * @api public
 */

function toColor(node) {
  if (node instanceof nodes.Color) return node;
  if (node instanceof nodes.Unit) {
    var n = node.val;
    return new nodes.Color(n,n,n,1);
  }
  throw new Error('unable to coerce ' + node + ' into a Color');
}