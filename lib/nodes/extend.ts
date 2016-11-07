
/*!
 * Stylus - Extend
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import Node = require('./node');

/**
 * Initialize a new `Extend` with the given `selectors` array.
 *
 * @param {Array} selectors array of the selectors
 * @api public
 */

export = class Extend extends Node {
  constructor(public selectors){
  super();
  this.selectors = selectors;
}

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

clone(){
  return new Extend(this.selectors);
}

/**
 * Return `@extend selectors`.
 *
 * @return {String}
 * @api public
 */

toString(){
  return '@extend ' + this.selectors.join(', ');
}

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

toJSON(){
  return {
    __type: 'Extend',
    selectors: this.selectors,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
}
}
