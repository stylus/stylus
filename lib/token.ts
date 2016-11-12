
/*!
 * Stylus - Token
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import {inspect} from 'util';

/**
 * Initialize a new `Token` with the given `type` and `val`.
 *
 * @param {StringNode} type
 * @param {Mixed} val
 * @api private
 */

export = class Token {
  lineno;
  column;
  space;
  constructor(public type: string, public val?) {
  }

  /**
   * Custom inspect.
   */
  inspect(): string {
    var val = ' ' + inspect(this.val);
    return '[Token:' + this.lineno + ':' + this.column + ' '
      + '\x1b[32m' + this.type + '\x1b[0m'
      + '\x1b[33m' + (this.val ? val : '') + '\x1b[0m'
      + ']';
  };

  /**
   * Return type or val.
   */
  toString() : string {
    return (undefined === this.val
      ? this.type
      : this.val).toString();
  }
}