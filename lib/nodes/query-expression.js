
/*!
 * Stylus - QueryExpr
 * Copyright(c) 2014 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `QueryExpr` with the given `segs`.
 *
 * @param {Array} segs
 * @api public
 */

var QueryExpr = module.exports = function QueryExpr(segs){
  Node.call(this);
  this.segments = segs;
  this.expr = null;
};

/**
 * Inherit from `Node.prototype`.
 */

QueryExpr.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

QueryExpr.prototype.clone = function(parent){
  var clone = new QueryExpr;
  clone.segments = this.segments.map(function(node){ return node.clone(parent, clone); });
  if (this.expr) clone.expr = this.expr.clone(parent, clone);
  if (this.name) clone.name = this.name;
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return "<ident>" or "(<ident>: <expr>)"
 *
 * @return {String}
 * @api public
 */

QueryExpr.prototype.toString = function(){
  if (this.expr) {
    return '(' + this.segments.join('') + ': ' + this.expr.toString() + ')';
  } else {
    return this.segments.join('');
  }
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

QueryExpr.prototype.toJSON = function(){
  var json = {
    __type: 'QueryExpr',
    segments: this.segments,
    lineno: this.lineno,
    filename: this.filename
  };
  if (this.expr) json.expr = this.expr;
  if (this.name) json.name = this.name;
  return json;
};
