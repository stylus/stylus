
/*!
 * CSS - Property
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

var Property = module.exports = function Property(name, val){
  this.name = name;
  this.val = val;
};

Property.prototype.inspect = function(){
  return '[Property '
    + '\x1b[33m' + this.name + '\x1b[0m'
    + ' ' + this.val
    + ']';
};
