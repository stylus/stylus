
/*!
 * CSS - Variable
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('./');

/**
 * Initialize a new `Variable` by `name` with the given `val` node.
 *
 * @param {String} name
 * @param {Node} val
 * @api public
 */

var Variable = module.exports = function Variable(name, val){
  Node.call(this);
  this.name = name;
  this.val = val || nodes.null;
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
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Variable.prototype.clone = function(){
  return new Variable(this.name, this.val);
};

/**
 * Return @<name>.
 *
 * @return {String}
 * @api public
 */

Variable.prototype.toString = function(){
  return '@' + this.name;
};
