/*!
 * Stylus - MozDocument
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
var Node = require('./node')
  , nodes = require('./');

/**
 * Initialize a new `MozDocument` with the given `val`
 *
 * @param {String} val
 * @api public
 */

var MozDocument = module.exports = function MozDocument(val){
  Node.call(this);
  this.val = val;
};

/**
 * Inherit from `Node.prototype`.
 */

MozDocument.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 *
 * @return {Node}
 * @api public
 */

MozDocument.prototype.clone = function(parent){
  var clone = new MozDocument(this.val);
  clone.block = this.block.clone(parent, clone);
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

MozDocument.prototype.toJSON = function(){
  return {
    __type: 'MozDocument',
    val: this.val,
    block: this.block,
    lineno: this.lineno,
    filename: this.filename
  };
};

/**
 * Return @-moz-document val
 */

MozDocument.prototype.toString = function(){
  return '@-moz-document ' + this.val;
}
