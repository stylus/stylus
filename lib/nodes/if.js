
/*!
 * CSS - If
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `If` with the given `cond`.
 *
 * @param {Expression} cond
 * @param {Boolean|Block} negate, ifBlock
 * @param {Block} elseBlock
 * @api public
 */

var If = module.exports = function If(cond, negate){
  Node.call(this);
  this.cond = cond;
  this.elses = [];
  if (negate instanceof Node) {
    this.ifBlock = negate;
  } else {
    this.negate = negate;
  }
};

/**
 * Inherit from `Node.prototype`.
 */

If.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

If.prototype.clone = function(){
  var cond = this.cond.clone()
    , ifBlock = this.ifBlock.clone();
  var clone = new If(cond, ifBlock);
  clone.elses = this.elses.map(function(node){ return node.clone(); });
  clone.negate = this.negate;
  clone.lineno = this.lineno;
  return clone;
};
