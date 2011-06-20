
/*!
 * Stylus - String
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , sprintf = require('../functions').s
  , utils = require('../utils')
  , nodes = require('./');

/**
 * Initialize a new `String` with the given `val`.
 *
 * @param {String} val
 * @api public
 */

var String = module.exports = function String(val){
  Node.call(this);
  this.val = val;
  this.string = val;
};

/**
 * Inherit from `Node.prototype`.
 */

String.prototype.__proto__ = Node.prototype;

/**
 * Return quoted string.
 *
 * @return {String}
 * @api public
 */

String.prototype.toString = function(){
  return '"' + this.val + '"';
};

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

String.prototype.clone = function(){
  var clone = new String(this.val);
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return Boolean based on the length of this string.
 *
 * @return {Boolean}
 * @api public
 */

String.prototype.toBoolean = function(){
  return nodes.Boolean(this.val.length);
};

/**
 * Coerce `other` to a string.
 *
 * @param {Node} other
 * @return {String}
 * @api public
 */

String.prototype.coerce = function(other){
  return 'string' == other.nodeName
    ? other
    : new String(other.toString());
};

/**
 * Operate on `right` with the given `op`.
 *
 * @param {String} op
 * @param {Node} right
 * @return {Node}
 * @api public
 */

String.prototype.operate = function(op, right){
  switch (op) {
    case '%':
      var expr = new nodes.Expression;
      expr.push(this);

      // constructargs
      var args = 'expression' == right.nodeName
        ? utils.unwrap(right).nodes
        : [right];

      // apply
      return sprintf.apply(null, [expr].concat(args));
    case '+':
      return new String(this.val + this.coerce(right.first).val);
    default:
      return Node.prototype.operate.call(this, op, right);
  }
};
