
/*!
 * Stylus - Page
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Page` with the given `selector` and `block`.
 *
 * @param {Selector} selector
 * @param {Block} block
 * @api public
 */

var Page = module.exports = function Page(selector, block){
  Node.call(this);
  this.selector = selector;
  this.block = block;
};

/**
 * Inherit from `Node.prototype`.
 */

Page.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Page.prototype.clone = function(parent){
  var clone = new Page;
  clone.selector = this.selector && this.selector.clone(parent, clone);
  clone.block = this.block.clone(parent, clone);
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  return clone;
};

Page.prototype.toJSON = function(){
  this.__type = 'Page';
  return this;
};

/**
 * Return `@page name`.
 *
 * @return {String}
 * @api public
 */

Page.prototype.toString = function(){
  return '@page ' + this.selector;
};
