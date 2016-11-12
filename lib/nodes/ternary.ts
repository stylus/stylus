
/*!
 * Stylus - Ternary
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import {Node} from './node';

/**
 * Initialize a new `Ternary` with `cond`, `trueExpr` and `falseExpr`.
 *
 * @param {Expression} cond
 * @param {Expression} trueExpr
 * @param {Expression} falseExpr
 * @api public
 */

export class Ternary extends Node {
  constructor(public cond?, public trueExpr?, public falseExpr?){
  super();
}

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

clone(parent){
  var clone = new Ternary();
  clone.cond = this.cond.clone(parent, clone);
  clone.trueExpr = this.trueExpr.clone(parent, clone);
  clone.falseExpr = this.falseExpr.clone(parent, clone);
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
    __type: 'Ternary',
    cond: this.cond,
    trueExpr: this.trueExpr,
    falseExpr: this.falseExpr,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
}
}
