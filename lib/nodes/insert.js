
/*!
 * Stylus - Insert
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Insert` with the given `expr`.
 *
 * @param {Expression} expr
 * @api public
 */

var Insert = module.exports = function Insert(expr, once){
  Node.call(this);
  this.path = expr;
  this.once = once || false;
};

/**
 * Inherit from `Node.prototype`.
 */

Insert.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 *
 * @return {Node}
 * @api public
 */

Insert.prototype.clone = function(parent){
  var clone = new Insert();
  clone.path = this.path.nodeName ? this.path.clone(parent, clone) : this.path;
  clone.once = this.once;
  clone.mtime = this.mtime;
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Insert.prototype.toJSON = function(){
  return {
    __type: 'Insert',
    path: this.path,
    once: this.once,
    mtime: this.mtime,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
};
