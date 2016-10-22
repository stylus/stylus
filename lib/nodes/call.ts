
/*!
 * Stylus - Call
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import Node = require('./node');

/**
 * Initialize a new `Call` with `name` and `args`.
 *
 * @param {String} name
 * @param {Expression} args
 * @api public
 */

export = class Call extends Node {
  block;

  constructor(public name, public args?){
  super();
}

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

clone(parent){
  var clone = new Call(this.name);
  clone.args = this.args.clone(parent, clone);
  if (this.block) clone.block = this.block.clone(parent, clone);
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return <name>(param1, param2, ...).
 *
 * @return {String}
 * @api public
 */

toString(){
  var args = this.args.nodes.map(function(node) {
    var str = node.toString();
    return str.slice(1, str.length - 1);
  }).join(', ');

  return this.name + '(' + args + ')';
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

toJSON(){
  var json: any = {
    __type: 'Call',
    name: this.name,
    args: this.args,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
  if (this.block) json.block = this.block;
  return json;
}
}
