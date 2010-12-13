
/*!
 * CSS - Property
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Property` with the given `name` and `val`
 *
 * @param {String} name
 * @param {String} val
 * @api public
 */

var Property = module.exports = function Property(name, val){
  this.name = name;
  this.val = val;
};

/**
 * Inherit from `Node.prototype`.
 */

Property.prototype.__proto__ = Node.prototype;

