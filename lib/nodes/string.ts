/*!
 * Stylus - String
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import {Node} from './node';
import {s as sprintf} from '../functions';
import utils = require('../utils');
import nodes = require('./');

/**
 * Initialize a new `String` with the given `val`.
 *
 * @param {StringNode} val
 * @param {StringNode} quote
 * @api public
 */

export class StringNode extends Node {
  string;
  prefixed = false;
  quote;

  constructor(public val, quote?){
  super();
  this.string = val;
  if (typeof quote !== 'string') {
    this.quote = "'";
  } else {
    this.quote = quote;
  }
}

  get nodeName() {
    return 'string';
  }

/**
 * Return quoted string.
 *
 * @return {String}
 * @api public
 */

toString(){
  return this.quote + this.val + this.quote;
}

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

clone(){
  var clone = new StringNode(this.val, this.quote);
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
    __type: 'String',
    val: this.val,
    quote: this.quote,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
}

/**
 * Return Boolean based on the length of this string.
 *
 * @return {Boolean}
 * @api public
 */

toBoolean(){
  return nodes.booleanNode(this.val.length);
}

/**
 * Coerce `other` to a string.
 *
 * @param {Node} other
 * @return {String}
 * @api public
 */

coerce(other){
  switch (other.nodeName) {
    case 'string':
      return other;
    case 'expression':
      return new StringNode(other.nodes.map(function(node){
        return this.coerce(node).val;
      }, this).join(' '));
    default:
      return new StringNode(other.toString());
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
  switch (op) {
    case '%':
      var expr = new nodes.Expression;
      expr.push(this);

      // constructargs
      var args = 'expression' == right.nodeName
        ? utils.unwrap(right).nodes
        : [right];

      // apply
      return sprintf.apply({}, [expr].concat(args));
    case '+':
      var expr = new nodes.Expression;
      expr.push(new StringNode(this.val + this.coerce(right).val));
      return expr;
    default:
      return super.operate(op, right);
  }
}
}
