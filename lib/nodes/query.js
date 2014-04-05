
/*!
 * Stylus - Query
 * Copyright(c) 2014 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Query`.
 *
 * @param {QueryExpr} query
 * @api public
 */

var Query = module.exports = function Query(query){
  Node.call(this);
  this.nodes = query ? [query] : [];
  this.predicate = '';
};

/**
 * Inherit from `Node.prototype`.
 */

Query.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Query.prototype.clone = function(){
  var clone = new Query;
  clone.predicate = this.predicate;
  for (var i = 0, len = this.nodes.length; i < len; ++i) {
    clone.push(this.nodes[i].clone());
  }
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  return clone;
};

/**
 * Push the given `expr`.
 *
 * @param {QueryExpr} expr
 * @api public
 */

Query.prototype.push = function(expr){
  this.nodes.push(expr);
};

/**
 * Return "<a> and <b> and <c>"
 *
 * @return {String}
 * @api public
 */

Query.prototype.toString = function(){
  var pred = this.predicate ? this.predicate + ' ' : '';
  return pred + this.nodes.map(function(expr){
    return expr.toString();
  }).join(' and ');
};

