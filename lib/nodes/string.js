
/*!
 * CSS - String
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

var Unit = module.exports = function Unit(val){
  this.val = val;
};

Unit.prototype.inspect = function(){
  return '[String '
    + '\x1b[33m' + this.val + '\x1b[0m'
    + ']';
};
