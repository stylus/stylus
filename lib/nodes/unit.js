
/*!
 * CSS - Unit
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

var Unit = module.exports = function Unit(val, type){
  this.val = val;
  this.type = type;
};

Unit.prototype.inspect = function(){
  return '[Unit '
    + '\x1b[32m' + this.val + '\x1b[0m'
    + '\x1b[33m' + this.type + '\x1b[0m'
    + ']';
};
