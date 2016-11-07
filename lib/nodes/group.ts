
/*!
 * Stylus - Group
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import Node = require('./node');

/**
 * Initialize a new `Group`.
 *
 * @api public
 */

export = class Group extends Node {
  private nodes = [];
  private extends = [];

  constructor(){
  super();
}

/**
 * Push the given `selector` node.
 *
 * @param {Selector} selector
 * @api public
 */

push(selector){
  this.nodes.push(selector);
}

/**
 * Return this set's `Block`.
 */

get block(){
  return this.nodes[0].block;
}

/**
 * Assign `block` to each selector in this set.
 *
 * @param {Block} block
 * @api public
 */

set block(block){
  for (var i = 0, len = this.nodes.length; i < len; ++i) {
    this.nodes[i].block = block;
  }
}

/**
 * Check if this set has only placeholders.
 *
 * @return {Boolean}
 * @api public
 */

get hasOnlyPlaceholders(){
  return this.nodes.every(function(selector) { return selector.isPlaceholder; });
}

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

clone(parent){
  var clone = new Group;
  clone.lineno = this.lineno;
  clone.column = this.column;
  this.nodes.forEach(function(node){
    clone.push(node.clone(parent, clone));
  });
  clone.filename = this.filename;
  clone.block = this.block.clone(parent, clone);
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
    __type: 'Group',
    nodes: this.nodes,
    block: this.block,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
}
}
