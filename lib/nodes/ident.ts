
/*!
 * Stylus - Ident
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import {Node} from './node';
import nodes = require('./');

/**
 * Initialize a new `Ident` by `name` with the given `val` node.
 *
 * @param {StringNode} name
 * @param {Node} val
 * @api public
 */

export class Ident extends Node {
  string;
  mixin;
  property;
  rest;

  constructor(public name, val?, mixin?){
  super();
  this.string = name;
  this.val = val || nodes.nullNode;
  this.mixin = !!mixin;
}

/**
 * Check if the variable has a value.
 *
 * @return {Boolean}
 * @api public
 */

get isEmpty(){
  return undefined == this.val;
}

/**
 * Return hash.
 *
 * @return {String}
 * @api public
 */

get hash(){
  return this.name;
}

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

clone(parent){
  var clone = new Ident(this.name);
  clone.val = this.val.clone(parent, clone);
  clone.mixin = this.mixin;
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  clone.property = this.property;
  clone.rest = this.rest;
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
    __type: 'Ident',
    name: this.name,
    val: this.val,
    mixin: this.mixin,
    property: this.property,
    rest: this.rest,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
}

/**
 * Return <name>.
 *
 * @return {String}
 * @api public
 */

toString(){
  return this.name;
}

/**
 * Coerce `other` to an ident.
 *
 * @param {Node} other
 * @return {String}
 * @api public
 */

coerce(other){
  switch (other.nodeName) {
    case 'ident':
    case 'string':
    case 'literal':
      return new Ident(other.string);
    case 'unit':
      return new Ident(other.toString());
    default:
      return Node.prototype.coerce.call(this, other);
  }
}

/**
 * Operate on `right` with the given `op`.
 *
 * @param {String} op
 * @param {Node} right
 * @return {Node}
 * @api public
 */

operate(op, right){
  var val = right.first;
  switch (op) {
    case '-':
      if ('unit' == val.nodeName) {
        var expr = new nodes.Expression;
        val = val.clone();
        val.val = -val.val;
        expr.push(this);
        expr.push(val);
        return expr;
      }
    case '+':
      return new nodes.Ident(this.string + this.coerce(val).string);
  }
  return Node.prototype.operate.call(this, op, right);
}
}
