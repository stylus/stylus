
/*!
 * CSS - Import
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Import` with the given `path`.
 *
 * @param {String} path
 * @api public
 */

var Import = module.exports = function Import(path){
  Node.call(this);
  this.path = path;
};

/**
 * Inherit from `Node.prototype`.
 */

Import.prototype.__proto__ = Node.prototype;
