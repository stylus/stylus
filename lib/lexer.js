
/*!
 * CSS - Lexer
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Initialize a new `Lexer` with the given `str` and `options`.
 *
 * @param {String} str
 * @param {Object} options
 * @api private
 */

var Lexer = module.exports = function Lexer(str, options) {
  options = options || {};
  this.str = str;
  this.filename = options.filename || 'css';
};

/**
 * Lexer prototype.
 */

Lexer.prototype = {
  get next() {
    
  }
};
