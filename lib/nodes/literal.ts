
/*!
 * Stylus - Literal
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import Node = require('./node');
import nodes = require('./');

/**
 * Initialize a new `Literal` with the given `str`.
 *
 * @param {String} str
 * @api public
 */

export = class Literal extends Node {
  prefixed = false;
  constructor(public string){
  super();
  this.val = string;
};

/**
 * Return hash.
 *
 * @return {String}
 * @api public
 */

get hash(){
  return this.val;
}

/**
 * Return literal value.
 *
 * @return {String}
 * @api public
 */

toString(){
  return this.val.toString();
};

/**
 * Coerce `other` to a literal.
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
      return new Literal(other.string);
    default:
      return super.coerce(other);
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
    case '+':
      return new nodes.Literal(this.string + this.coerce(val).string);
    default:
      return super.operate(op, right);
  }
}

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

toJSON(){
  return {
    __type: 'Literal',
    val: this.val,
    string: this.string,
    prefixed: this.prefixed,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
}
}
