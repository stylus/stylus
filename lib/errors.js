
/*!
 * Stylus - errors
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Initialize a new `ParseError` with the given `msg`.
 *
 * @param {String} msg
 * @api private
 */

class ParseError extends Error {
  constructor(msg) {
    super();
    this.name = 'ParseError';
    this.message = msg;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ParseError);
    }
  }
}

/**
 * Initialize a new `SyntaxError` with the given `msg`.
 *
 * @param {String} msg
 * @api private
 */

class SyntaxError extends Error {
  constructor(msg) {
    super();
    this.name = 'SyntaxError';
    this.message = msg;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ParseError);
    }
  }
}

/**
 * Expose constructors.
 */

exports.ParseError = ParseError;
exports.SyntaxError = SyntaxError;
