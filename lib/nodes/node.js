
/*!
 * CSS - Node
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Serializer = require('../visitor/serializer');

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

/**
 * Convert node(s) to a JSON string.
 *
 * @return {String}
 * @api public
 */

Node.prototype.toJSON = function(){
  return JSON.stringify(new Serializer(this).serialize());
};
