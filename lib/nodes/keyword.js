
/*!
 * CSS - Keyword
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

var Keyword = module.exports = function Keyword(val){
  this.val = val;
};

Keyword.prototype.inspect = function(){
  return '[Keyword '
    + '\x1b[33m' + this.val + '\x1b[0m'
    + ']';
};
