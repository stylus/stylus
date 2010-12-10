
/*!
 * CSS - Parser
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Lexer = require('./lexer')
  , nodes = require('./nodes');

/**
 * Initialize a new `Parser` with the given `str` and `options`.
 *
 * @param {String} str
 * @param {Object} options
 * @api private
 */

var Parser = module.exports = function Parser(str, options) {
  options = options || {};
  this.str = str;
  this.filename = options.filename || 'css';
  this.lexer = new Lexer(str, options);
};

/**
 * Parser prototype.
 */

Parser.prototype = {
  
  /**
   * Parse the input, then return the root node.
   *
   * @return {Node}
   * @api private
   */

   parse: function(){
     var tok
       , block = this.root = new nodes.Block;
     while ('eos' != (tok = this.lexer.next).type) {
       block.push(this.statement);
     }
     return block;
   }
};
