
/*!
 * CSS - Variable
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Variable` by `name` with the given `val` node.
 *
 * @param {String} name
 * @param {Node} val
 * @api public
 */

var Variable = module.exports = function Variable(name, val){
  this.name = name;
  this.val = val;
};

/**
 * Check if the variable has a value.
 *
 * @return {Boolean}
 * @api public
 */

Variable.prototype.__defineGetter__('isEmpty', function(){
  return undefined == this.val;
});

/**
 * Inherit from `Node.prototype`.
 */

Variable.prototype.__proto__ = Node.prototype;

/**
 * Return @<name>.
 *
 * @return {String}
 * @api public
 */

Variable.prototype.toString = function(){
  return '@' + this.name;
};
