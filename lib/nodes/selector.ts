
/*!
 * Stylus - Selector
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import Block = require('./block');
import Node = require('./node');

/**
 * Initialize a new `Selector` with the given `segs`.
 *
 * @param {Array} segs
 * @api public
 */

export = class Selector extends Node {
  inherits = true;
  optional = false;
  constructor(public segments?){
  super();
}

/**
 * Return the selector string.
 *
 * @return {String}
 * @api public
 */

toString(){
  return this.segments.join('') + (this.optional ? ' !optional' : '');
}

/**
 * Check if this is placeholder selector.
 *
 * @return {Boolean}
 * @api public
 */

get isPlaceholder(){
  return this.val && ~this.val.substr(0, 2).indexOf('$');
}

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

clone(parent){
  var clone = new Selector;
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  clone.inherits = this.inherits;
  clone.val = this.val;
  clone.segments = this.segments.map(function(node){ return node.clone(parent, clone); });
  clone.optional = this.optional;
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
    __type: 'Selector',
    inherits: this.inherits,
    segments: this.segments,
    optional: this.optional,
    val: this.val,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
}
}
