
/*!
 * Stylus - Root
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import Node = require('./node');

/**
 * Initialize a new `Root` node.
 *
 * @api public
 */

export = class Root extends Node {
  nodes = [];
  constructor(){
    super();
}

/**
 * Push a `node` to this block.
 *
 * @param {Node} node
 * @api public
 */

push(node){
  this.nodes.push(node);
}

/**
 * Unshift a `node` to this block.
 *
 * @param {Node} node
 * @api public
 */

unshift(node){
  this.nodes.unshift(node);
}

/**
 * Return a clone of this node.
 *
 * @return {Node}
 * @api public
 */

clone(){
  var clone = new Root();
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  this.nodes.forEach(function(node){
    clone.push(node.clone(clone, clone));
  });
  return clone;
}

/**
 * Return "root".
 *
 * @return {String}
 * @api public
 */

toString(){
  return '[Root]';
}

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

toJSON(){
  return {
    __type: 'Root',
    nodes: this.nodes,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
}
}
