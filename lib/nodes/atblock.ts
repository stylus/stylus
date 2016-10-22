/*!
 * Stylus - @block
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import Node = require('./node');

/**
 * Initialize a new `@block` node.
 *
 * @api public
 */

export = class Atblock extends Node {
  block;
  fileno;

  constructor(){
  super();
};

/**
 * Return `block` nodes.
 */

get nodes(){
  return this.block.nodes;
}

/**
 * Return a clone of this node.
 *
 * @return {Node}
 * @api public
 */

clone(parent) {
  var clone = new Atblock;
  clone.block = this.block.clone(parent, clone);
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return @block.
 *
 * @return {String}
 * @api public
 */

toString(){
  return '@block';
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

toJSON(): any {
  return {
    __type: 'Atblock',
    block: this.block,
    lineno: this.lineno,
    column: this.column,
    fileno: this.fileno
  };
}
}
