
/*!
 * CSS - Variable
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

var Variable = module.exports = function Variable(name, val){
  this.name = name;
  this.val = val;
};

Variable.prototype.inspect = function(){
  return '[Variable ' + this.name + ' ' + this.val.inspect() + ']';
};
