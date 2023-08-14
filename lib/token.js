
/*!
 * Stylus - Token
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var inspect = require('util').inspect;

exports = module.exports = class Token {
  /**
   * Initialize a new `Token` with the given `type` and `val`.
   *
   * @param {String} type
   * @param {Mixed} val
   * @api private
   */

  constructor(type, val) {
    this.type = type;
    this.val = val;
  }

  /**
   * Custom inspect.
   *
   * @return {String}
   * @api public
   */

  inspect() {
    var val = ' ' + inspect(this.val);
    return '[Token:' + this.lineno + ':' + this.column + ' '
      + '\x1b[32m' + this.type + '\x1b[0m'
      + '\x1b[33m' + (this.val ? val : '') + '\x1b[0m'
      + ']';
  };

  /**
   * Return type or val.
   *
   * @return {String}
   * @api public
   */

  toString() {
    return (undefined === this.val
      ? this.type
      : this.val).toString();
  };
};
