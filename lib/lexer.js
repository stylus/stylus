
/*!
 * CSS - Lexer
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Token = require('./token')
  , nodes = require('./nodes');

/**
 * Initialize a new `Lexer` with the given `str` and `options`.
 *
 * @param {String} str
 * @param {Object} options
 * @api private
 */

var Lexer = module.exports = function Lexer(str, options) {
  options = options || {};
  this.str = str;
  this.filename = options.filename || 'css';
  this.stash = [];
};

/**
 * Lexer prototype.
 */

Lexer.prototype = {
  get next() {
    return this.stashed
      || this.color
      || this.property
      || this.selector;
  },
  
  get peek() {
    if (this.stash.length) {
      return this.stash[0];
    } else {
      return this.stash.push(this.next);
    }
  },

  get stashed() {
    return this.stash.shift();
  },

  get color() {
    return this.hexColor;
  },
  
  get hexColor() {
    console.log(this.str);
  },
  
  get property() {
    
  },
  
  get selector() {
    
  }
};
