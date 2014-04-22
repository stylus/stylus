
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
 * @api public
 */

var Query = module.exports = function Query(){
  Node.call(this);
  this.nodes = [];
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

Query.prototype.clone = function(parent){
  var clone = new Query;
  clone.predicate = this.predicate;
  for (var i = 0, len = this.nodes.length; i < len; ++i) {
    clone.push(this.nodes[i].clone(parent, clone));
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

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Query.prototype.toJSON = function(){
  return {
    __type: 'Query',
    predicate: this.predicate,
    nodes: this.nodes,
    lineno: this.lineno,
    filename: this.filename
  };
};
