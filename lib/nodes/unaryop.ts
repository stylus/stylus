
/*!
 * Stylus - UnaryOp
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import {Node} from './node';

/**
 * Initialize a new `UnaryOp` with `op`, and `expr`.
 *
 * @param {StringNode} op
 * @param {Node} expr
 * @api public
 */

export class UnaryOp extends Node {constructor(public op, public expr?){
  super();
}

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

clone(parent){
  var clone = new UnaryOp(this.op);
  clone.expr = this.expr.clone(parent, clone);
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

toJSON(){
  return {
    __type: 'UnaryOp',
    op: this.op,
    expr: this.expr,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
}
}
