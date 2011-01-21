
/*!
 * CSS - Expression
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('../nodes');

/**
 * Initialize a new `Expression`.
 *
 * @param {Boolean} isList
 * @api public
 */

var Expression = module.exports = function Expression(isList){
  Node.call(this);
  this.nodes = [];
  this.isList = isList;
};

/**
 * Check if the variable has a value.
 *
 * @return {Boolean}
 * @api public
 */

Expression.prototype.__defineGetter__('isEmpty', function(){
  return !this.nodes.length;
});

/**
 * Return the first node in this expression.
 *
 * @return {Node}
 * @api public
 */

Expression.prototype.__defineGetter__('first', function(){
  return this.nodes[0].first;
});

/**
 * Return the last node in this expression.
 *
 * @return {Node}
 * @api public
 */

Expression.prototype.__defineGetter__('last', function(){
  return this.nodes[this.nodes.length - 1].first;
});

/**
 * Inherit from `Node.prototype`.
 */

Expression.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Expression.prototype.clone = function(){
  var clone = new Expression(this.isList);
  clone.lineno = this.lineno;
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

Expression.prototype.push = function(node){
  this.nodes.push(node);
};

/**
 * Operate on `right` with the given `op`.
 *
 * @param {String} op
 * @param {Node} right
 * @return {Node}
 * @api public
 */

Expression.prototype.operate = function(op, right){
  switch (op) {
    case '[]':
      return this.nodes[right.val] || nodes.null;
    default:
      return Node.prototype.operate.call(this, op, right);
  }
};

