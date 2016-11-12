
/*!
 * Stylus - Node
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import {Evaluator} from '../visitor/evaluator';
import utils = require('../utils');
import nodes = require('./');
import {BooleanNode} from './boolean';
import {Expression} from './expression';

/**
 * Initialize a new `CoercionError` with the given `msg`.
 *
 * @param {StringNode} msg
 * @api private
 */

class CoercionError extends Error {
  constructor(msg) {
    super();
  this.name = 'CoercionError';
  this.message = msg;
  Error.captureStackTrace(this, CoercionError);
}
}
/**
 * Node constructor.
 *
 * @api public
 */

export class Node {
  lineno;
  column;
  filename;
  val;
  constructor(){
  this.lineno = nodes.lineno || 1;
  this.column = nodes.column || 1;
  this.filename = nodes.filename;
};

  /**
   * Return this node.
   */
  get first(): Node {
    return this;
  }

  /**
   * Return hash.
   *
   * @return {String}
   * @api public
   */

  get hash() {
    return this.val;
  }

  /**
   * Return node name.
   */

  get nodeName(): string {
    return (<any>this.constructor).name.toLowerCase();
  }

  /**
   * Return this node.
   */
  clone(..._): Node {
    return this;
  }

  /**
   * Return a JSON representation of this node.
   *
   * @return {Object}
   * @api public
   */

  toJSON(): any {
    return {
      lineno: this.lineno,
      column: this.column,
      filename: this.filename
    };
  }

  /**
   * Nodes by default evaluate to themselves.
   *
   * @return {Node}
   * @api public
   */

  eval(): Node {
    return new Evaluator(this).evaluate();
  }

  /**
   * Return true.
   */

  toBoolean(): BooleanNode {
    return nodes.trueNode;
  }

  /**
   * Return the expression, or wrap this node in an expression.
   *
   * @return {Expression}
   * @api public
   */

  toExpression(): Expression {
    if ('expression' == this.nodeName) return <any>this;
    var expr = new nodes.Expression;
    expr.push(this);
    return expr;
  }

  /**
   * Return false if `op` is generally not coerced.
   *
   * @param {String} op
   * @return {BooleanNode}
   * @api private
   */

  shouldCoerce(op: string): boolean {
    switch (op) {
      case 'is a':
      case 'in':
      case '||':
      case '&&':
        return false;
      default:
        return true;
    }
  }

  /**
   * Operate on `right` with the given `op`.
   */

  operate(op: string, right: Node, val?): Node {
    switch (op) {
      case 'is a':
        if ('string' == right.first.nodeName) {
          return nodes.booleanNode(this.nodeName == right.val);
        } else {
          throw new Error('"is a" expects a string, got ' + right.toString());
        }
      case '==':
        return nodes.booleanNode(this.hash == right.hash);
      case '!=':
        return nodes.booleanNode(this.hash != right.hash);
      case '>=':
        return nodes.booleanNode(this.hash >= right.hash);
      case '<=':
        return nodes.booleanNode(this.hash <= right.hash);
      case '>':
        return nodes.booleanNode(this.hash > right.hash);
      case '<':
        return nodes.booleanNode(this.hash < right.hash);
      case '||':
        return this.toBoolean().isTrue
          ? this
          : right;
      case 'in':
        var vals = utils.unwrap(right).nodes
          , len = vals && vals.length
          , hash = this.hash;
        if (!vals) throw new Error('"in" given invalid right-hand operand, expecting an expression');

        // 'prop' in obj
        if (1 == len && 'object' == vals[0].nodeName) {
          return nodes.booleanNode(vals[0].has(this.hash));
        }

        for (var i = 0; i < len; ++i) {
          if (hash == vals[i].hash) {
            return nodes.trueNode;
          }
        }
        return nodes.falseNode;
      case '&&':
        var a = this.toBoolean()
          , b = right.toBoolean();
        return a.isTrue && b.isTrue
          ? right
          : a.isFalse
            ? this
            : right;
      default:
        if ('[]' == op) {
          var msg = 'cannot perform '
            + this
            + '[' + right + ']';
        } else {
          var msg = 'cannot perform'
            + ' ' + this
            + ' ' + op
            + ' ' + right;
        }
        throw new Error(msg);
    }
  }

  /**
   * Default coercion throws.
   *
   * @param {Node} other
   * @return {Node}
   * @api public
   */

  coerce(other){
    if (other.nodeName == this.nodeName) return other;
    throw new CoercionError('cannot coerce ' + other + ' to ' + this.nodeName);
  }
}
