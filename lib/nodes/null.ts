
/*!
 * Stylus - Null
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import Node = require('./node');
import nodes = require('./');

/**
 * Initialize a new `Null` node.
 *
 * @api public
 */

export = class Null extends Node {
  constructor(){
    super();
  };

/**
 * Return 'Null'.
 *
 * @return {String}
 * @api public
 */

inspect = this.toString;
toString(){
  return 'null';
}

/**
 * Return false.
 *
 * @return {Boolean}
 * @api public
 */

toBoolean(){
  return nodes.falseNode;
}

/**
 * Check if the node is a null node.
 *
 * @return {Boolean}
 * @api public
 */

get isNull(){
  return true;
}

/**
 * Return hash.
 *
 * @return {String}
 * @api public
 */

get hash(){
  return null;
}

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

toJSON(){
  return {
    __type: 'Null',
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
}
}
