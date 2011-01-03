
/*!
 * CSS - RuleSet
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

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

/**
 * Return this set's `Block`.
 */

RuleSet.prototype.__defineGetter__('block', function(){
  return this.nodes[0].block;
});

/**
 * Assign `block` to each selector in this set.
 *
 * @param {Block} block
 * @api public
 */

RuleSet.prototype.setBlock = function(block){
  for (var i = 0, len = this.nodes.length; i < len; ++i) {
    this.nodes[i].block = block;
  }
};
