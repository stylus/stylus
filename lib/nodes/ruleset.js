
/*!
 * CSS - RuleSet
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Block = require('./block')
  , Node = require('./node');

/**
 * Initialize a new `RuleSet`.
 *
 * @api public
 */

var RuleSet = module.exports = function RuleSet(){
  Node.call(this);
  this.nodes = [];
};

/**
 * Inherit from `Node.prototype`.
 */

RuleSet.prototype.__proto__ = Node.prototype;

/**
 * Push the given `selector` node.
 *
 * @param {Selector} selector
 * @api public
 */

RuleSet.prototype.push = function(selector){
  this.nodes.push(selector);
};
