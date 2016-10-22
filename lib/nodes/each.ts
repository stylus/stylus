
/*!
 * Stylus - Each
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import Node = require('./node');
import nodes = require('./');

/**
 * Initialize a new `Each` node with the given `val` name,
 * `key` name, `expr`, and `block`.
 *
 * @param {String} val
 * @param {String} key
 * @param {Expression} expr
 * @param {Block} block
 * @api public
 */

export = class Each extends Node {
  constructor(val, public key, public expr?, public block?) {
    super();
  this.val = val;
}

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

clone(parent){
  var clone = new Each(this.val, this.key);
  clone.expr = this.expr.clone(parent, clone);
  clone.block = this.block.clone(parent, clone);
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
    __type: 'Each',
    val: this.val,
    key: this.key,
    expr: this.expr,
    block: this.block,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
}
}
