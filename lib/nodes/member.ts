
/*!
 * Stylus - Member
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import {Node} from './node';

/**
 * Initialize a new `Member` with `left` and `right`.
 *
 * @param {Node} left
 * @param {Node} right
 * @api public
 */

export class Member extends Node {
  constructor(public left?, public right?){
  super();
}

/**
 * Return a clone of this node.
 *
 * @return {Node}
 * @api public
 */

clone(parent){
  var clone = new Member;
  clone.left = this.left.clone(parent, clone);
  clone.right = this.right.clone(parent, clone);
  if (this.val) clone.val = this.val.clone(parent, clone);
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
  var json: any = {
    __type: 'Member',
    left: this.left,
    right: this.right,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
  if (this.val) json.val = this.val;
  return json;
}

/**
 * Return a string representation of this node.
 *
 * @return {String}
 * @api public
 */

toString(){
  return this.left.toString()
    + '.' + this.right.toString();
}
}
