
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
    return new nodes.Color(
        left.r + right.r
      , left.g + right.g
      , left.b + right.b
      , left.a + right.a
      );
  },
  
  '-': function(left, right){
    return new nodes.Color(
        left.r - right.r
      , left.g - right.g
      , left.b - right.b
      , 1 == right.a ? left.a : (left.a - right.a)
      );
  },
  
  '*': function(left, right){
    return new nodes.Color(
        left.r * right.r
      , left.g * right.g
      , left.b * right.b
      , left.a * right.a
      );      
  },
  
  '/': function(left, right){
    return new nodes.Color(
        left.r / right.r
      , left.g / right.g
      , left.b / right.b
      , left.a / right.a
      );      
  }  
};