
/*!
 * CSS - Evaluator - operations
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var nodes = require('../../nodes')
  , utils = require('./utils');

/**
 * Global operations.
 */

exports.all = {
  'is a': function(left, right){
    var val = right.val
      , name = left.constructor.name;
    return nodes.Boolean(val == name || val == name.toLowerCase());
  },
  
  '==': function(left, right){
    return nodes.Boolean(left.val == right.val);
  },
  
  '>': function(left, right){
    return nodes.Boolean(left.val > right.val);
  },
  
  '<': function(left, right){
    return nodes.Boolean(left.val < right.val);
  },
  
  '>=': function(left, right){
    return nodes.Boolean(left.val >= right.val);
  },
  
  '<=': function(left, right){
    return nodes.Boolean(left.val <= right.val);
  },

  '||': function(left, right){
    return nodes.true == left.toBoolean()
      ? left
      : right;
  },
  
  '&&': function(left, right){
    var a = left.toBoolean()
      , b = right.toBoolean();
    return nodes.true == a && nodes.true == b
      ? right
      : nodes.false == a
        ? left
        : right;
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
  },
  
  '%': function(left, right){
    return new nodes.Unit(left.val % right.val, left.type || right.type);
  },
  
  '**': function(left, right){
    return new nodes.Unit(Math.pow(left.val, right.val), left.type || right.type);
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
 * Ident operations.
 */

exports.ident = {};

/**
 * Color operations.
 */

exports.color = {
  '+': function(left, right){
    right = utils.toColor(right);
    return new nodes.Color(
        left.r + right.r
      , left.g + right.g
      , left.b + right.b
      , 1 == right.a ? left.a : (left.a + right.a)
      );
  },
  
  '-': function(left, right){
    right = utils.toColor(right);
    return new nodes.Color(
        left.r - right.r
      , left.g - right.g
      , left.b - right.b
      , 1 == right.a ? left.a : (left.a - right.a)
      );
  },
  
  '*': function(left, right){
    right = utils.toColor(right);
    return new nodes.Color(
        left.r * right.r
      , left.g * right.g
      , left.b * right.b
      , left.a * right.a
      );      
  },
  
  '/': function(left, right){
    right = utils.toColor(right);
    return new nodes.Color(
        left.r / right.r
      , left.g / right.g
      , left.b / right.b
      , left.a / right.a
      );      
  },
  
  '==': function(left, right){
    return nodes.Boolean(left.toString() == right.toString());
  },
  
  '>': function(left, right){
    return nodes.Boolean(left.toString() > right.toString());
  },
  
  '<': function(left, right){
    return nodes.Boolean(left.toString() < right.toString());
  },
  
  '>=': function(left, right){
    return nodes.Boolean(left.toString() >= right.toString());
  },
  
  '<=': function(left, right){
    return nodes.Boolean(left.toString() <= right.toString());
  }
};