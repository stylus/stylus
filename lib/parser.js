
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
  
  expect: function(type){
    if (type != this.peek.type) {
      throw new Error('expected ' + type + ', got ' + this.peek.type);
    }
    return this.next;
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
      case 'selector':
        return this.selector;
      case 'property':
        return this.property;
      default:
        throw new Error('invalid token "' + this.peek.type + '"');
    }
  },

  get block() {
    var block = new nodes.Block;
    this.expect('indent');
    while ('outdent' != this.peek.type) {
      block.push(this.statement);
    }
    this.expect('outdent');
    return block;
  },

  get property() {
    var prop = this.next.val
      , val = this.next;
    switch (val.type) {
      case 'color':
        return new nodes.Property(prop, val.val);
      default:
        throw new Error('invalid property value "' + val.type + '"');
    }
  },

  get selector() {
    return new nodes.Selector(this.next.val, this.block);
  },
  
  get variable() {
    var name = this.next.val;
    if ('assignment' == this.peek.type) {
      this.next;
      switch (this.peek.type) {
        case 'color':
          return new nodes.Variable(name, this.next.val);
        default:
          throw new Error('invalid right-side operand in assignment, got "' + this.peek.type + '"');
      }
    }
    return new nodes.Variable(name);
  }
};
