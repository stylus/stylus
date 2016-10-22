
/*!
 * Stylus - Params
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import Node = require('./node');

/**
 * Initialize a new `Params` with `name`, `params`, and `body`.
 *
 * @param {String} name
 * @param {Params} params
 * @param {Expression} body
 * @api public
 */

export = class Params extends Node {

  nodes = [];

  constructor(){
    super();
  }

/**
 * Check function arity.
 *
 * @return {Boolean}
 * @api public
 */

get length(){
  return this.nodes.length;
}

/**
 * Push the given `node`.
 *
 * @param {Node} node
 * @api public
 */

push(node){
  this.nodes.push(node);
}

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

clone(parent){
  var clone = new Params;
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  this.nodes.forEach(function(node){
    clone.push(node.clone(parent, clone));
  });
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
    __type: 'Params',
    nodes: this.nodes,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
}
}

