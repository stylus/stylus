/*!
 * Stylus - supports
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import Atrule = require('./atrule');

/**
 * Initialize a new supports node.
 *
 * @param {Expression} condition
 * @api public
 */

export = class Supports extends Atrule {
  constructor(public condition?){
  super('supports');
}

/**
 * Return a clone of this node.
 *
 * @return {Node}
 * @api public
 */

clone(parent){
  var clone = new Supports;
  clone.condition = this.condition.clone(parent, clone);
  clone.block = this.block.clone(parent, clone);
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
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
    __type: 'Supports',
    condition: this.condition,
    block: this.block,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
}

/**
 * Return @supports
 *
 * @return {String}
 * @api public
 */

toString(){
  return '@supports ' + this.condition;
}
}
