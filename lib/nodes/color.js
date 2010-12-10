
/*!
 * CSS - Color
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

var Color = module.exports = function Color(r,g,b,a){
  this.r = r;
  this.g = g;
  this.b = b;
  this.a = a;
};

Color.prototype.inspect = function(){
  return '[Color rgba('
    + this.r + ','
    + this.g + ','
    + this.b + ','
    + this.a + ')]';
};
