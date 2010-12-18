
/*!
 * CSS - stack - Frame
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Scope = require('./scope')
  , nodes = require('../nodes');

/**
 * Initialize a new `Frame` with the given `node`.
 *
 * @param {Node} node
 * @api private
 */

var Frame = module.exports = function Frame(node) {
  this.scope = new Scope;
  this.node = node;
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

/**
 * Custom inspect.
 *
 * @return {String}
 * @api public
 */

Frame.prototype.inspect = function(){
  return '[Frame '
    + this.node + ' '
    + this.scope.inspect()
    + ']';
};
