
/*!
 * Stylus - BinOp
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import {Node} from './node';

/**
 * Initialize a new `BinOp` with `op`, `left` and `right`.
 *
 * @param {StringNode} op
 * @param {Node} left
 * @param {Node} right
 * @api public
 */

export class BinOp extends Node {
  constructor(public op, public left?, public right?){
  super();
}

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

clone(parent){
  var clone = new BinOp(this.op);
  clone.left = this.left.clone(parent, clone);
  clone.right = this.right && this.right.clone(parent, clone);
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  if (this.val) clone.val = this.val.clone(parent, clone);
  return clone;
};

/**
 * Return <left> <op> <right>
 *
 * @return {String}
 * @api public
 */
toString() {
  return this.left.toString() + ' ' + this.op + ' ' + this.right.toString();
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

toJSON(){
  var json: any = {
    __type: 'BinOp',
    left: this.left,
    right: this.right,
    op: this.op,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
  if (this.val) json.val = this.val;
  return json;
}
}
