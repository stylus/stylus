
/*!
 * Stylus - Keyframes
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Keyframes` with the given `name`,
 * and optional vendor `prefix`.
 *
 * @param {String} name
 * @param {String} prefix
 * @api public
 */

var Keyframes = module.exports = function Keyframes(name, prefix){
  Node.call(this);
  this.name = name;
  this.frames = [];
  this.prefix = prefix || 'official';
};

/**
 * Inherit from `Node.prototype`.
 */

Keyframes.prototype.__proto__ = Node.prototype;

/**
 * Push the given `block` at `pos`.
 *
 * @param {Array} pos
 * @param {Block} block
 * @api public
 */

Keyframes.prototype.push = function(pos, block){
  this.frames.push({
      pos: pos
    , block: block
  });
};

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Keyframes.prototype.clone = function(parent){
  var clone = new Keyframes(this.name);
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  clone.prefix = this.prefix;
  this.frames.forEach(function(node){
    clone.push(node.pos, node.block.clone(parent, clone));
  });
  return clone;
};

Keyframes.prototype.toJSON = function(){
  this.__type = 'Keyframes';
  return this;
};

/**
 * Return `@keyframes name`.
 *
 * @return {String}
 * @api public
 */

Keyframes.prototype.toString = function(){
  return '@keyframes ' + this.name;
};
