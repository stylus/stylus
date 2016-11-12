
/*!
 * Stylus - Expression
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import {Node} from './node';
import nodes = require('../nodes');
import utils = require('../utils');
import {BooleanNode} from './boolean';

/**
 * Initialize a new `Expression`.
 *
 * @param {BooleanNode} isList
 * @api public
 */

export class Expression extends Node {
  nodes: Node[] = [];
  preserve;

  constructor(public isList?){
  super();
}

/**
 * Check if the variable has a value.
 */

get isEmpty(): boolean {
  return !this.nodes.length;
}

/**
 * Return the first node in this expression.
 */

get first(): Node {
  return this.nodes[0]
    ? this.nodes[0].first
    : nodes.nullNode;
}

/**
 * Hash all the nodes in order.
 */
get hash(): string {
  return this.nodes.map(function(node){
    return node.hash;
  }).join('::');
}

/**
 * Return a clone of this node.
 */

clone(parent: Node): Node {
  var clone = new (<any>this.constructor)(this.isList);
  clone.preserve = this.preserve;
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  clone.nodes = this.nodes.map(function(node) {
    return node.clone(parent, clone);
  });
  return clone;
};

/**
 * Push the given `node`.
 */

push(node: Node){
  this.nodes.push(node);
}

/**
 * Operate on `right` with the given `op`.
 */

operate(op: string, right: Expression, val: Node){
  switch (op) {
    case '[]=':
      var self = this
        , range = utils.unwrap(right).nodes
        , val = <Node>utils.unwrap(val)
        , len: number
        , node;
      range.forEach(function(unit){
        len = self.nodes.length;
        if ('unit' == unit.nodeName) {
          var i = unit.val < 0 ? len + unit.val : unit.val
            , n = i;
          while (i-- > len) self.nodes[i] = nodes.nullNode;
          self.nodes[n] = val;
        } else if (unit.string) {
          node = self.nodes[0];
          if (node && 'object' == node.nodeName) node.set(unit.string, val.clone());
        }
      });
      return val;
    case '[]':
      var expr = new nodes.Expression
        , vals = utils.unwrap(this).nodes
        , range = utils.unwrap(right).nodes
        , node;
      range.forEach(function(unit){
        if ('unit' == unit.nodeName) {
          node = vals[unit.val < 0 ? vals.length + unit.val : unit.val];
        } else if ('object' == vals[0].nodeName) {
          node = vals[0].get(unit.string);
        }
        if (node) expr.push(node);
      });
      return expr.isEmpty
        ? nodes.nullNode
        : utils.unwrap(expr);
    case '||':
      return this.toBoolean().isTrue
        ? this
        : right;
    case 'in':
      return Node.prototype.operate.call(this, op, right);
    case '!=':
      return this.operate('==', right, val).negate();
    case '==':
      var len = this.nodes.length
        , right = right.toExpression()
        , a
        , b;
      if (len != right.nodes.length) return nodes.falseNode;
      for (var i = 0; i < len; ++i) {
        a = this.nodes[i];
        b = right.nodes[i];
        if (a.operate(op, b).isTrue) continue;
        return nodes.falseNode;
      }
      return nodes.trueNode;
    default:
      return this.first.operate(op, right, val);
  }
}

/**
 * Expressions with length > 1 are truthy,
 * otherwise the first value's toBoolean()
 * method is invoked.
 */
toBoolean(): BooleanNode {
  if (this.nodes.length > 1) return nodes.trueNode;
  return this.first.toBoolean();
}

/**
 * Return "<a> <b> <c>" or "<a>, <b>, <c>" if
 * the expression represents a list.
 */
toString(): string {
  return '(' + this.nodes.map(function(node){
    return node.toString();
  }).join(this.isList ? ', ' : ' ') + ')';
}

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

toJSON(){
  return {
    __type: 'Expression',
    isList: this.isList,
    preserve: this.preserve,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename,
    nodes: this.nodes
  };
}
}
