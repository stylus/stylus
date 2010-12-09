
/*!
 * CSS - Token
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Initialize a new `Token` with the given `type` and `val`.
 *
 * @param {String} type
 * @param {Mixed} val
 * @api private
 */

var Token = module.exports = function Token(type, val) {
  this.type = type;
  this.val = val;
};