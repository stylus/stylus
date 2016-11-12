
/*!
 * Stylus - Comment
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import {Node} from './node';

/**
 * Initialize a new `Comment` with the given `str`.
 *
 * @param {StringNode} str
 * @param {BooleanNode} suppress
 * @param {BooleanNode} inline
 * @api public
 */

export class Comment extends Node {
  private str;
  private suppress;
  private inline;

  constructor(str, suppress, inline){
  super();
  this.str = str;
  this.suppress = suppress;
  this.inline = inline;
}

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

toJSON(){
  return {
    __type: 'Comment',
    str: this.str,
    suppress: this.suppress,
    inline: this.inline,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
}

/**
 * Return comment.
 *
 * @return {String}
 * @api public
 */

toString(){
  return this.str;
}
}
