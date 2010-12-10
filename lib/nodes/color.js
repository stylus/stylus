
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
  return '[Color \x1b[33mrgba\x1b[0m('
    + '\x1b[31m' + this.r + '\x1b[0m,'
    + '\x1b[32m' + this.g + '\x1b[0m,'
    + '\x1b[34m' + this.b + '\x1b[0m,'
    + this.a + ')]';
};
