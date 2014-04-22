
/*!
 * Stylus - Return
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('./');

/**
 * Initialize a new `Return` node with the given `expr`.
 *
 * @param {Expression} expr
 * @api public
 */

var Return = module.exports = function Return(expr){
  this.expr = expr || nodes.null;
};

/**
 * Inherit from `Node.prototype`.
 */

Return.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Return.prototype.clone = function(parent){
  var clone = new Return();
  clone.expr = this.expr.clone(parent, clone);
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Return.prototype.toJSON = function(){
  return {
    __type: 'Return',
    expr: this.expr,
    lineno: this.lineno,
    filename: this.filename
  };
};
