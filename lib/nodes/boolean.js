
/*!
 * Stylus - Boolean
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('./');

module.exports = class Boolean extends Node {
  /**
   * Initialize a new `Boolean` node with the given `val`.
   *
   * @param {Boolean} val
   * @api public
   */

  constructor(val) {
    super();
    if (this.nodeName) {
      this.val = !!val;
    } else {
      return new Boolean(val);
    }
  }

  /**
   * Return `this` node.
   *
   * @return {Boolean}
   * @api public
   */

  toBoolean() {
    return this;
  };

  /**
   * Return `true` if this node represents `true`.
   *
   * @return {Boolean}
   * @api public
   */

  get isTrue() {
    return this.val;
  };

  /**
   * Return `true` if this node represents `false`.
   *
   * @return {Boolean}
   * @api public
   */

  get isFalse() {
    return !this.val;
  };

  /**
   * Negate the value.
   *
   * @return {Boolean}
   * @api public
   */

  negate() {
    return new Boolean(!this.val);
  };

  /**
   * Return 'Boolean'.
   *
   * @return {String}
   * @api public
   */

  inspect() {
    return '[Boolean ' + this.val + ']';
  };

  /**
   * Return 'true' or 'false'.
   *
   * @return {String}
   * @api public
   */

  toString() {
    return this.val
      ? 'true'
      : 'false';
  };

  /**
   * Return a JSON representaiton of this node.
   *
   * @return {Object}
   * @api public
   */

  toJSON() {
    return {
      __type: 'Boolean',
      val: this.val
    };
  };
};
