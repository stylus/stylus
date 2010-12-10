
/*!
 * CSS - Block
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

var Block = module.exports = function Block(){
  this.nodes = [];
};

Block.prototype.push = function(node){
  this.nodes.push(node);
};

Block.prototype.inspect = function(){
  return '[Block ' + this.nodes.map(function(node){
    return node.inspect();
  }).join('\n') + ']';
};

