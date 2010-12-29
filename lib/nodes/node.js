
/*!
 * CSS - Node
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Serializer = require('../visitor/serializer')
  , Evaluator = require('../visitor/evaluator')
  , nodes = require('./');

/**
 * Node constructor.
 *
 * @api public
 */

var Node = module.exports = function Node(){
  this.lineno = nodes.lineno;
};

/**
 * Return this node.
 *
 * @return {Node}
 * @api public
 */

Node.prototype.__defineGetter__('first', function(){
  return this;
});

/**
 * Return hash.
 *
 * @return {Node}
 * @api public
 */

Node.prototype.__defineGetter__('hash', function(){
  return this.val;
});

/**
 * Return node name.
 *
 * @return {String}
 * @api public
 */

Node.prototype.__defineGetter__('nodeName', function(){
  return this.constructor.name.toLowerCase();
});

/**
 * Return this node.
 * 
 * @return {Node}
 * @api public
 */

Node.prototype.clone = function(){
  return this;
};

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

/**
 * Return true.
 *
 * @return {Boolean}
 * @api public
 */

Node.prototype.toBoolean = function(){
  return nodes.true;
};

/**
 * Operate on `right` with the given `op`.
 *
 * @param {String} op
 * @param {Node} right
 * @return {Node}
 * @api public
 */

Node.prototype.operate = function(op, right){
  switch (op) {
    case 'is a':
      var name = this.constructor.name;
      return nodes.Boolean(right.val == name
        || right.val == name.toLowerCase());
    case '==':
      return nodes.Boolean(this.hash == right.hash);
    case '>=':
      return nodes.Boolean(this.hash >= right.hash);
    case '<=':
      return nodes.Boolean(this.hash <= right.hash);
    case '>':
      return nodes.Boolean(this.hash > right.hash);
    case '<':
      return nodes.Boolean(this.hash < right.hash);
    case '||':
      return nodes.true == this.toBoolean()
        ? this
        : right;
    case '&&':
      var a = this.toBoolean()
        , b = right.toBoolean();
      return nodes.true == a && nodes.true == b
        ? right
        : nodes.false == a
          ? this
          : right;
    default:
      throw new Error('cannot perform ' + op + ' operation on ' + this);
  }
};

/**
 * Default coercion throws.
 *
 * @param {Node} other
 * @return {Node}
 * @api public
 */

Node.prototype.coerce = function(other){
  if (other.nodeName == this.nodeName) return other;
  throw new Error('cannot coerce ' + other + ' to ' + this.nodeName);
};
