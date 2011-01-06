
/*!
 * CSS - Ident
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('./');

/**
 * Initialize a new `Ident` by `name` with the given `val` node.
 *
 * @param {String} name
 * @param {Node} val
 * @api public
 */

var Ident = module.exports = function Ident(name, val){
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

Ident.prototype.__defineGetter__('isEmpty', function(){
  return undefined == this.val;
});

/**
 * Inherit from `Node.prototype`.
 */

Ident.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Ident.prototype.clone = function(){
  return new Ident(this.name, this.val.clone());
};

/**
 * Return @<name>.
 *
 * @return {String}
 * @api public
 */

Ident.prototype.toString = function(){
  return '@' + this.name;
};
