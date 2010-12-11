
/*!
 * CSS - Comment
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

var Comment = module.exports = function Comment(val){
  this.val = val;
};

Comment.prototype.inspect = function(){
  return '[Comment '
    + '\x1b[33m' + this.val + '\x1b[0m'
    + ']';
};
