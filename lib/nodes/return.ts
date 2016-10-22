
/*!
 * Stylus - Return
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import Node = require('./node');
import nodes = require('./');

/**
 * Initialize a new `Return` node with the given `expr`.
 *
 * @param {Expression} expr
 * @api public
 */

export = class Return extends Node {
  constructor(public expr = nodes.nullNode){
  super();
}

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

clone(parent){
  var clone = new Return();
  clone.expr = this.expr.clone(parent, clone);
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  return clone;
}

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

toJSON(){
  return {
    __type: 'Return',
    expr: this.expr,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
}
}
