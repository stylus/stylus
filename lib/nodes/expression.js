
/*!
 * Stylus - Expression
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('../nodes')
  , utils = require('../utils');

module.exports = class Expression extends Node {
  /**
   * Initialize a new `Expression`.
   *
   * @param {Boolean} isList
   * @api public
   */

  constructor(isList) {
    super();
    this.nodes = [];
    this.isList = isList;
  }

  /**
   * Check if the variable has a value.
   *
   * @return {Boolean}
   * @api public
   */

  get isEmpty() {
    return !this.nodes.length;
  };

  /**
   * Return the first node in this expression.
   *
   * @return {Node}
   * @api public
   */

  get first() {
    return this.nodes[0]
      ? this.nodes[0].first
      : nodes.null;
  };

  /**
   * Hash all the nodes in order.
   *
   * @return {String}
   * @api public
   */

  get hash() {
    return this.nodes.map(function (node) {
      return node.hash;
    }).join('::');
  };

  /**
   * Return a clone of this node.
   * 
   * @return {Node}
   * @api public
   */

  clone(parent) {
    var clone = new this.constructor(this.isList);
    clone.preserve = this.preserve;
    clone.lineno = this.lineno;
    clone.column = this.column;
    clone.filename = this.filename;
    clone.nodes = this.nodes.map(function (node) {
      return node.clone(parent, clone);
    });
    return clone;
  };

  /**
   * Push the given `node`.
   *
   * @param {Node} node
   * @api public
   */

  push(node) {
    this.nodes.push(node);
  };

  /**
   * Operate on `right` with the given `op`.
   *
   * @param {String} op
   * @param {Node} right
   * @return {Node}
   * @api public
   */

  operate(op, right, val) {
    switch (op) {
      case '[]=':
        var self = this
          , range = utils.unwrap(right).nodes
          , val = utils.unwrap(val)
          , len
          , node;
        range.forEach(function (unit) {
          len = self.nodes.length;
          if ('unit' == unit.nodeName) {
            var i = unit.val < 0 ? len + unit.val : unit.val
              , n = i;
            while (i-- > len) self.nodes[i] = nodes.null;
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
        range.forEach(function (unit) {
          if ('unit' == unit.nodeName) {
            node = vals[unit.val < 0 ? vals.length + unit.val : unit.val];
          } else if ('object' == vals[0].nodeName) {
            node = vals[0].get(unit.string);
          }
          if (node) expr.push(node);
        });
        return expr.isEmpty
          ? nodes.null
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
        if (len != right.nodes.length) return nodes.false;
        for (var i = 0; i < len; ++i) {
          a = this.nodes[i];
          b = right.nodes[i];
          if (a.operate(op, b).isTrue) continue;
          return nodes.false;
        }
        return nodes.true;
        break;
      default:
        return this.first.operate(op, right, val);
    }
  };

  /**
   * Expressions with length > 1 are truthy,
   * otherwise the first value's toBoolean()
   * method is invoked.
   *
   * @return {Boolean}
   * @api public
   */

  toBoolean() {
    if (this.nodes.length > 1) return nodes.true;
    return this.first.toBoolean();
  };

  /**
   * Return "<a> <b> <c>" or "<a>, <b>, <c>" if
   * the expression represents a list.
   *
   * @return {String}
   * @api public
   */

  toString() {
    return '(' + this.nodes.map(function (node) {
      return node.toString();
    }).join(this.isList ? ', ' : ' ') + ')';
  };

  /**
   * Return a JSON representation of this node.
   *
   * @return {Object}
   * @api public
   */

  toJSON() {
    return {
      __type: 'Expression',
      isList: this.isList,
      preserve: this.preserve,
      lineno: this.lineno,
      column: this.column,
      filename: this.filename,
      nodes: this.nodes
    };
  };
};
