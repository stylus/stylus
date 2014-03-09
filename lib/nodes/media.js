
/*!
 * Stylus - Media
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('./');

/**
 * Initialize a new `Media` with the given `val`
 *
 * @param {String} val
 * @api public
 */

var Media = module.exports = function Media(val){
  Node.call(this);
  this.val = val;
};

/**
 * Inherit from `Node.prototype`.
 */

Media.prototype.__proto__ = Node.prototype;

/**
 * Clone this node.
 *
 * @return {Media}
 * @api public
 */

Media.prototype.clone = function(parent){
  var clone = new Media(this.val);
  clone.block = this.block.clone(parent, clone);
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  return clone;
};

Media.prototype.toJSON = function(){
  this.__type = 'Media';
  return this;
};

/**
 * Return @media "val".
 *
 * @return {String}
 * @api public
 */

Media.prototype.toString = function(){
  return '@media ' + this.val;
};
