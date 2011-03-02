
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
 * Initialize a new `Keyframes` with the given `name`.
 *
 * @param {String} name
 * @api public
 */

var Keyframes = module.exports = function Keyframes(name){
  Node.call(this);
  this.name = name;
  this.frames = [];
};

/**
 * Inherit from `Node.prototype`.
 */

Keyframes.prototype.__proto__ = Node.prototype;

/**
 * Push the given `block` at `pos`.
 *
 * @param {Unit} pos
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
 * Return `@keyframes name`.
 *
 * @return {String}
 * @api public
 */

Keyframes.prototype.toString = function(){
  return '@keyframes ' + this.name;
};
