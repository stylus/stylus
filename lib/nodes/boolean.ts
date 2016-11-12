
/*!
 * Stylus - Boolean
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import {Node} from './node';
import nodes = require('./');

export function booleanNode(val): BooleanNode {
  return new BooleanNode(val);
}

/**
 * Initialize a new `Boolean` node with the given `val`.
 *
 * @param {BooleanNode} val
 * @api public
 */

export class BooleanNode extends Node {
  constructor(val){
  super();
  this.val = !!val;
}

  get nodeName() {
    return 'boolean';
  }

/**
 * Return `this` node.
 */

toBoolean(): BooleanNode {
  return this;
}

/**
 * Return `true` if this node represents `true`.
 *
 * @return {Boolean}
 * @api public
 */

get isTrue(): boolean {
  return this.val;
}

/**
 * Return `true` if this node represents `false`.
 */

get isFalse(): boolean {
  return ! this.val;
}

/**
 * Negate the value.
 */

negate(): BooleanNode {
  return new BooleanNode(!this.val);
}

/**
 * Return 'Boolean'.
 */

inspect(): string {
  return '[Boolean ' + this.val + ']';
}

/**
 * Return 'true' or 'false'.
 */

toString(): string {
  return this.val
    ? 'true'
    : 'false';
}

/**
 * Return a JSON representaiton of this node.
 */

toJSON(){
  return {
    __type: 'Boolean',
    val: this.val
  };
}
}
