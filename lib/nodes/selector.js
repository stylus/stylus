
/*!
 * CSS - Selector
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Block = require('./block')
  , Node = require('./node');

var Selector = module.exports = function Selector(val){
  this.val = val;
  this.block = new Block;
};

Selector.prototype.inspect = function(){
  return '[Selector '
    + '\x1b[33m' + this.name + '\x1b[0m'
    + this.block.inspect()
    + ']';
};
