
/*!
 * Stylus - Unit
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import {Node} from './node';
import nodes = require('./');

/**
 * Unit conversion table.
 */

var FACTOR_TABLE = {
  'mm': {val: 1, label: 'mm'},
  'cm': {val: 10, label: 'mm'},
  'in': {val: 25.4, label: 'mm'},
  'pt': {val: 25.4/72, label: 'mm'},
  'ms': {val: 1, label: 'ms'},
  's': {val: 1000, label: 'ms'},
  'Hz': {val: 1, label: 'Hz'},
  'kHz': {val: 1000, label: 'Hz'}
};

/**
 * Initialize a new `Unit` with the given `val` and unit `type`
 * such as "px", "pt", "in", etc.
 *
 * @param {StringNode} val
 * @param {StringNode} type
 * @api public
 */

export class Unit extends Node {
  raw;
  constructor(public val, public type?){
  super();
}

/**
 * Return Boolean based on the unit value.
 *
 * @return {Boolean}
 * @api public
 */

toBoolean(){
  return nodes.booleanNode(this.type
      ? true
      : this.val);
}

/**
 * Return unit string.
 *
 * @return {String}
 * @api public
 */

toString(){
  return this.val + (this.type || '');
}

/**
 * Return a clone of this node.
 *
 * @return {Node}
 * @api public
 */

clone(){
  var clone = new Unit(this.val, this.type);
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
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
    __type: 'Unit',
    val: this.val,
    type: this.type,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
}

/**
 * Operate on `right` with the given `op`.
 *
 * @param {String} op
 * @param {Node} right
 * @return {Node}
 * @api public
 */

operate(op, right){
  var type = this.type || right.first.type;

  // swap color
  if ('rgba' == right.nodeName || 'hsla' == right.nodeName) {
    return right.operate(op, this);
  }

  // operate
  if (this.shouldCoerce(op)) {
    right = right.first;
    // percentages
    if ('%' != this.type && ('-' == op || '+' == op) && '%' == right.type) {
      right = new Unit(this.val * (right.val / 100), '%');
    } else {
      right = this.coerce(right);
    }

    switch (op) {
      case '-':
        return new Unit(this.val - right.val, type);
      case '+':
        // keyframes interpolation
        type = type || (right.type == '%' && right.type);
        return new Unit(this.val + right.val, type);
      case '/':
        return new Unit(this.val / right.val, type);
      case '*':
        return new Unit(this.val * right.val, type);
      case '%':
        return new Unit(this.val % right.val, type);
      case '**':
        return new Unit(Math.pow(this.val, right.val), type);
      case '..':
      case '...':
        var start = this.val
          , end = right.val
          , expr = new nodes.Expression
          , inclusive = '..' == op;
        if (start < end) {
          do {
            expr.push(new nodes.Unit(start));
          } while (inclusive ? ++start <= end : ++start < end);
        } else {
          do {
            expr.push(new nodes.Unit(start));
          } while (inclusive ? --start >= end : --start > end);
        }
        return expr;
    }
  }

  return super.operate(op, right);
}

/**
 * Coerce `other` unit to the same type as `this` unit.
 *
 * Supports:
 *
 *    mm -> cm | in
 *    cm -> mm | in
 *    in -> mm | cm
 *
 *    ms -> s
 *    s  -> ms
 *
 *    Hz  -> kHz
 *    kHz -> Hz
 *
 * @param {Unit} other
 * @return {Unit}
 * @api public
 */

coerce(other){
  if ('unit' == other.nodeName) {
    var a = this
      , b = other
      , factorA = FACTOR_TABLE[a.type]
      , factorB = FACTOR_TABLE[b.type];

    if (factorA && factorB && (factorA.label == factorB.label)) {
      var bVal = b.val * (factorB.val / factorA.val);
      return new nodes.Unit(bVal, a.type);
    } else {
      return new nodes.Unit(b.val, a.type);
    }
  } else if ('string' == other.nodeName) {
    // keyframes interpolation
    if ('%' == other.val) return new nodes.Unit(0, '%');
    var val = parseFloat(other.val);
    if (isNaN(val)) super.coerce(other);
    return new nodes.Unit(val);
  } else {
    return super.coerce(other);
  }
}
}
