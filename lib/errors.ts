
/*!
 * Stylus - errors
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Initialize a new `ParseError` with the given `msg`.
 *
 * @param {StringNode} msg
 * @api private
 */

export class ParseError extends Error {
  constructor(msg?: string) {
    super(msg);
  this.name = 'ParseError';
  this.message = msg;
  Error.captureStackTrace(this, ParseError);
  }
}

/**
 * Initialize a new `SyntaxError` with the given `msg`.
 *
 * @param {StringNode} msg
 * @api private
 */

export class SyntaxError extends Error {
  constructor(msg?: string) {
    super(msg);
  this.name = 'SyntaxError';
  this.message = msg;
  Error.captureStackTrace(this, ParseError);
  }
}