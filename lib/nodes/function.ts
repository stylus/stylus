
/*!
 * Stylus - Function
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import {Node} from './node';

/**
 * Initialize a new `Function` with `name`, `params`, and `body`.
 *
 * @param {StringNode} name
 * @param {Params|Function} params
 * @param {Block} body
 * @api public
 */

export class Function extends Node {
  fn;
  block;

  constructor(public name, public params?, public body?){
  super();
  if ('function' == typeof params) this.fn = params;
}

/**
 * Check function arity.
 *
 * @return {Boolean}
 * @api public
 */

get arity(){
  return this.params.length;
}

/**
 * Return hash.
 *
 * @return {String}
 * @api public
 */

get hash(){
  return 'function ' + this.name;
}

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

clone(parent){
  if (this.fn) {
    var clone = new Function(
        this.name
      , this.fn);
  } else {
    var clone = new Function(this.name);
    clone.params = this.params.clone(parent, clone);
    clone.block = this.block.clone(parent, clone);
  }
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  return clone;
}

/**
 * Return <name>(param1, param2, ...).
 *
 * @return {String}
 * @api public
 */

toString(){
  if (this.fn) {
    return this.name
      + '('
      + this.fn.toString()
        .match(/^function *\w*\((.*?)\)/)
        .slice(1)
        .join(', ')
      + ')';
  } else {
    return this.name
      + '('
      + this.params.nodes.join(', ')
      + ')';
  }
}

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

toJSON(){
  var json: any = {
    __type: 'Function',
    name: this.name,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
  if (this.fn) {
    json.fn = this.fn;
  } else {
    json.params = this.params;
    json.block = this.block;
  }
  return json;
}
}
