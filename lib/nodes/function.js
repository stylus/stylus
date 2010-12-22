
/*!
 * CSS - Function
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Function` with `name`, `params`, and `body`.
 *
 * @param {String} name
 * @param {Params} params
 * @param {Block} body
 * @api public
 */

var Function = module.exports = function Function(name, params, body){
  this.name = name;
  this.params = params;
  this.body = body;
  // TODO: change .body to .block
  this.block = body;
};

/**
 * Check function arity.
 *
 * @return {Boolean}
 * @api public
 */

Function.prototype.__defineGetter__('arity', function(){
  return this.params.length;
});

/**
 * Inherit from `Node.prototype`.
 */

Function.prototype.__proto__ = Node.prototype;

/**
 * Return <name>(@param1, @param2, ...).
 *
 * @return {String}
 * @api public
 */

Function.prototype.toString = function(){
  return this.name
    + '('
    + this.params.nodes.join(', ')
    + ')';
};
