
/*!
 * CSS - Node
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Serializer = require('../visitor/serializer')
  , Evaluator = require('../visitor/evaluator');

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
  return new Evaluator(this).evaluate();
};

/**
 * Convert node(s) to plain objects, for example
 * a `String` node will simply become a string literal.
 *
 * @return {Mixed}
 * @api public
 */

Node.prototype.toObject = function(){
  return new Serializer(this).serialize();
};

/**
 * Convert node(s) to a JSON string.
 *
 * @return {String}
 * @api public
 */

Node.prototype.toJSON = function(){
  return JSON.stringify(this.toObject());
};
