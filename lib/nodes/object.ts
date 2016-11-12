
/*!
 * Stylus - Object
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import {Node} from './node';
import nodes = require('./');

/**
 * Initialize a new `Object`.
 *
 * @api public
 */

export class ObjectNode extends Node {
  vals = {};

  constructor(){
  super();
};

get nodeName() {
  return 'object';
}

/**
 * Set `key` to `val`.
 *
 * @param {String} key
 * @param {Node} val
 * @return {Object} for chaining
 * @api public
 */

set(key, val){
  this.vals[key] = val;
  return this;
}

/**
 * Return length.
 *
 * @return {Number}
 * @api public
 */

get length() {
  return Object.keys(this.vals).length;
}

/**
 * Get `key`.
 *
 * @param {String} key
 * @return {Node}
 * @api public
 */

get(key){
  return this.vals[key] || nodes.nullNode;
}

/**
 * Has `key`?
 *
 * @param {String} key
 * @return {Boolean}
 * @api public
 */

has(key){
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

operate(op, right){
  switch (op) {
    case '.':
    case '[]':
      return this.get(right.hash);
    case '==':
      var vals = this.vals
        , a
        , b;
      if ('object' != right.nodeName || this.length != right.length)
        return nodes.falseNode;
      for (var key in vals) {
        a = vals[key];
        b = right.vals[key];
        if (a.operate(op, b).isFalse)
          return nodes.falseNode;
      }
      return nodes.trueNode;
    case '!=':
      return this.operate('==', right).negate();
    default:
      return super.operate(op, right);
  }
}

/**
 * Return Boolean based on the length of this object.
 *
 * @return {Boolean}
 * @api public
 */

toBoolean(){
  return nodes.booleanNode(this.length);
}

/**
 * Convert object to string with properties.
 *
 * @return {String}
 * @api private
 */

toBlock(){
  var str = '{'
    , key
    , val;
  for (key in this.vals) {
    val = this.get(key);
    if ('object' == val.first.nodeName) {
      str += key + ' ' + val.first.toBlock();
    } else {
      switch (key) {
        case '@charset':
          str += key + ' ' + val.first.toString() + ';';
          break;
        default:
          str += key + ':' + toString(val) + ';';
      }
    }
  }
  str += '}';
  return str;

  function toString(node) {
    if (node.nodes) {
      return node.nodes.map(toString).join(node.isList ? ',' : ' ');
    } else if ('literal' == node.nodeName && ',' == node.val) {
      return '\\,';
    }
    return node.toString();
  }
}

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

clone(parent){
  var clone = new ObjectNode;
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  for (var key in this.vals) {
    clone.vals[key] = this.vals[key].clone(parent, clone);
  }
  return clone;
}

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

toJSON(){
  return {
    __type: 'Object',
    vals: this.vals,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
}

/**
 * Return "{ <prop>: <val> }"
 *
 * @return {String}
 * @api public
 */

toString(){
  var obj = {};
  for (var prop in this.vals) {
    obj[prop] = this.vals[prop].toString();
  }
  return JSON.stringify(obj);
}
}
