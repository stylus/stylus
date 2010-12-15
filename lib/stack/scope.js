
/*!
 * CSS - stack - Scope
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Initialize a new `Scope`.
 *
 * @api private
 */

var Scope = module.exports = function Scope() {
  this.locals = {};
};

/**
 * Lookup the given local variable `name`.
 *
 * @param {String} name
 * @return {Node}
 * @api public
 */

Scope.prototype.lookup = function(name){
  return this.locals[name];
};
