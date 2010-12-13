
/*!
 * CSS - Node
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Node constructor.
 *
 * @api public
 */

var Node = module.exports = function Node(){};

/**
 * Nodes by default evaluate to themselves.
 *
 * @return {Node}
 * @api public
 */

Node.prototype.eval = function(){
  return this;
};
