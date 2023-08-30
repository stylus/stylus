
/*!
 * Stylus - Null
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('./');

/**
 * Initialize a new `Null` node.
 *
 * @api public
 */

module.exports = class Null extends Node {
  /**
 * Return 'Null'.
 *
 * @return {String}
 * @api public
 */

  toString() {
    return 'null';
  };

  inspect() {
    return 'null';
  }

  /**
  * Return false.
  *
  * @return {Boolean}
  * @api public
  */

  toBoolean() {
    return nodes.false;
  };

  /**
  * Check if the node is a null node.
  *
  * @return {Boolean}
  * @api public
  */

  get isNull() {
    return true;
  };

  /**
  * Return hash.
  *
  * @return {String}
  * @api public
  */

  get hash() {
    return null;
  };

  /**
  * Return a JSON representation of this node.
  *
  * @return {Object}
  * @api public
  */

  toJSON() {
    return {
      __type: 'Null',
      lineno: this.lineno,
      column: this.column,
      filename: this.filename
    };
  };
};
