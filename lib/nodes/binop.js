
/*!
 * Stylus - BinOp
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

module.exports = class BinOp extends Node {
  /**
   * Initialize a new `BinOp` with `op`, `left` and `right`.
   *
   * @param {String} op
   * @param {Node} left
   * @param {Node} right
   * @api public
   */

  constructor(op, left, right) {
    super();
    this.op = op;
    this.left = left;
    this.right = right;
  }

  /**
   * Return a clone of this node.
   * 
   * @return {Node}
   * @api public
   */

  clone(parent) {
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

  toJSON() {
    var json = {
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
  };

};
