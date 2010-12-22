
/*!
 * CSS - Evaluator - built-in functions
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var nodes = require('../../nodes');

exports.rgba = function(r,g,b,a){
  return new nodes.Color(
      r.val
    , g.val
    , b.val
    , a.val);
};

exports.rgb = function(r,g,b){
  var a = new nodes.Unit(1);
  return exports.rgba(r,g,b,a);
};