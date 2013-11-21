
/*!
 * Stylus - Object
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('./')
  , nativeObj = {}.constructor;

/**
 * Initialize a new `Object`.
 *
 * @api public
 */

var Object = module.exports = function Object(){
  Node.call(this);
  this.vals = {};
};

/**
 * Inherit from `Node.prototype`.
 */

Object.prototype.__proto__ = Node.prototype;

/**
 * Set `key` to `val`.
 *
 * @param {String} key
 * @param {Node} val
 * @return {Object} for chaining
 * @api public
 */

Object.prototype.set = function(key, val){
  this.vals[key] = val;
  return this;
};

/**
 * Return length.
 *
 * @return {Number}
 * @api public
 */

Object.prototype.__defineGetter__('length', function() {
  return nativeObj.keys(this.vals).length;
});

/**
 * Get `key`.
 *
 * @param {String} key
 * @return {Node}
 * @api public
 */

Object.prototype.get = function(key){
  return this.vals[key] || nodes.null;
};

/**
 * Has `key`?
 *
 * @param {String} key
 * @return {Boolean}
 * @api public
 */

Object.prototype.has = function(key){
  return key in this.vals;
};

/**
 * Operate on `right` with the given `op`.
 *
 * @param {String} op
 * @param {Node} right
 * @return {Node}
 * @api public
 */

Object.prototype.operate = function(op, right){
  switch (op) {
    case '.':
    case '[]':
      return this.get(right.hash);
    default:
      return Node.prototype.operate.call(this, op, right);
  }
};

/**
 * Return Boolean based on the length of this object.
 *
 * @return {Boolean}
 * @api public
 */

Object.prototype.toBoolean = function(){
  return nodes.Boolean(this.length);
};

/**
 * Convert object to string with properties.
 *
 * @return {String}
 * @api private
 */

Object.prototype.toBlock = function(){
  var str = '{'
    , key
    , val;
  for (key in this.vals) {
    val = this.get(key);
    if ('object' == val.first.nodeName) {
      str += key + ' ' + this.toBlock.call(val.first);
    } else {
      switch (key) {
        case '@charset':
          str += key + ' ' + val.first.toString() + ';';
          break;
        default:
          str += key + ':' + val.toString() + ';';
      }
    }
  }
  str += '}';
  return str;
};

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Object.prototype.clone = function(){
  var clone = new Object;
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  for (var key in this.vals) {
    clone.vals[key] = this.vals[key].clone();
  }
  return clone;
};

/**
 * Return "{ <prop>: <val> }"
 *
 * @return {String}
 * @api public
 */

Object.prototype.toString = function(){
  var obj = {};
  for (var prop in this.vals) {
    obj[prop] = this.vals[prop].toString();
  }
  return JSON.stringify(obj);
};
