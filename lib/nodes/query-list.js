
/*!
 * Stylus - QueryList
 * Copyright(c) 2014 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `QueryList`.
 *
 * @api public
 */

var QueryList = module.exports = function QueryList(){
  Node.call(this);
  this.nodes = [];
};

/**
 * Inherit from `Node.prototype`.
 */

QueryList.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

QueryList.prototype.clone = function(){
  var clone = new QueryList;
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  for (var i = 0; i < this.nodes.length; ++i) {
    clone.push(this.nodes[i].clone());
  }
  return clone;
};

/**
 * Push the given `node`.
 *
 * @param {Node} node
 * @api public
 */

QueryList.prototype.push = function(node){
  this.nodes.push(node);
};

/**
 * Return "<a>, <b>, <c>"
 *
 * @return {String}
 * @api public
 */

QueryList.prototype.toString = function(){
  return '(' + this.nodes.map(function(node){
    return node.toString();
  }).join(', ') + ')';
};

