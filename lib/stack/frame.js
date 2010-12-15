
/*!
 * CSS - stack - Frame
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Scope = require('./scope');

/**
 * Initialize a new `Frame`.
 *
 * @api private
 */

var Frame = module.exports = function Frame() {
  this.scope = new Scope;
};

/**
 * Lookup the given local variable `name`.
 *
 * @param {String} name
 * @return {Node}
 * @api private
 */

Frame.prototype.lookup = function(name){
  return this.scope.lookup(name);
};