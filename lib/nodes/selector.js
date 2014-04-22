
/*!
 * Stylus - Selector
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Block = require('./block')
  , Node = require('./node');

/**
 * Initialize a new `Selector` with the given `segs`.
 *
 * @param {Array} segs
 * @api public
 */

var Selector = module.exports = function Selector(segs){
  Node.call(this);
  this.inherits = true;
  this.segments = segs;
};

/**
 * Inherit from `Node.prototype`.
 */

Selector.prototype.__proto__ = Node.prototype;

/**
 * Return the selector string.
 *
 * @return {String}
 * @api public
 */

Selector.prototype.toString = function(){
  return this.segments.join('');
};

/**
 * Check if this is placeholder selector.
 *
 * @return {Boolean}
 * @api public
 */

Selector.prototype.__defineGetter__('isPlaceholder', function(){
  return this.val && ~this.val.substr(0, 2).indexOf('$');
});

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Selector.prototype.clone = function(parent){
  var clone = new Selector;
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  clone.inherits = this.inherits;
  clone.segments = this.segments.map(function(node){ return node.clone(parent, clone); });
  return clone;
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Selector.prototype.toJSON = function(){
  return {
    __type: 'Selector',
    inherits: this.inherits,
    segments: this.segments,
    lineno: this.lineno,
    filename: this.filename
  };
};
