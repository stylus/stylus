
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
    var block = this.root = new nodes.Block;
    while ('eos' != this.peek.type) {
      block.push(this.statement);
      console.log(block);
    }
    return block;
  },
  
  get next() {
    return this.lexer.next;
  },
  
  get peek() {
    return this.lexer.peek;
  },
  
  get statement() {
    switch (this.peek.type) {
      case 'variable':
        return this.variable;
      default:
        throw new Error('invalid token ' + this.peek.type);
    }
  },
  
  get variable() {
    var name = this.next.val;
    if ('assignment' == this.peek.type) {
      this.next;
      switch (this.peek.type) {
        case 'color':
          return new nodes.Variable(name, this.next);
        default:
          throw new Error('invalid right-side operand in assignment, got ' + this.peek.type);
      }
    }
    return new nodes.Variable(name);
  }
};
