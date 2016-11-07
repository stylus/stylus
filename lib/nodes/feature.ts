
/*!
 * Stylus - Feature
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import Node = require('./node');

/**
 * Initialize a new `Feature` with the given `segs`.
 *
 * @param {Array} segs
 * @api public
 */

export = class Feature extends Node {
  private expr;
  private name;

  constructor(public segments?: Array<any>){
  super();
  this.expr = null;
}

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

clone(parent){
  var clone = new Feature;
  clone.segments = this.segments.map(function(node){ return node.clone(parent, clone); });
  if (this.expr) clone.expr = this.expr.clone(parent, clone);
  if (this.name) clone.name = this.name;
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  return clone;
}

/**
 * Return "<ident>" or "(<ident>: <expr>)"
 *
 * @return {String}
 * @api public
 */

toString(){
  if (this.expr) {
    return '(' + this.segments.join('') + ': ' + this.expr.toString() + ')';
  } else {
    return this.segments.join('');
  }
}

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

toJSON(){
  var json: any = {
    __type: 'Feature',
    segments: this.segments,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
  if (this.expr) json.expr = this.expr;
  if (this.name) json.name = this.name;
  return json;
}
}
