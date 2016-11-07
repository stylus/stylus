
/*!
 * Stylus - Charset
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import Node = require('./node');

/**
 * Initialize a new `Charset` with the given `val`
 *
 * @param {String} val
 * @api public
 */

export = class Charset extends Node {
  constructor(val){
    super();
  this.val = val;
}

/**
 * Return @charset "val".
 *
 * @return {String}
 * @api public
 */

toString(){
  return '@charset ' + this.val;
}

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

toJSON(){
  return {
    __type: 'Charset',
    val: this.val,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
}
}
