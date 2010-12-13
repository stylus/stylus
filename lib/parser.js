
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
      if (this.accept('newline')) continue;
      block.push(this.statement);
    }
    return block;
  },

  accept: function(type){
    if (type == this.peek.type) {
      return this.next;
    }
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
    var type = this.peek.type;
    switch (type) {
      case 'variable':
        return this.variable;
      case 'selector':
        return this.selector;
      case 'property':
        return this.property;
      default:
        throw new Error('invalid token "' + type + '"');
    }
  },

  get block() {
    var block = new nodes.Block;
    this.expect('indent');
    while ('outdent' != this.peek.type) {
      if (this.accept('newline')) continue;
      block.push(this.statement);
    }
    this.expect('outdent');
    return block;
  },

  get property() {
    var tok
      , prop = this.next.val
      , val = this.next;
    switch (val.type) {
      case 'unit':
      case 'color':
        tok = new nodes.Property(prop, val.val);
        break;
      default:
        throw new Error('invalid property value "' + val.val.inspect() + '"');
    }
    return tok;
  },

  get selector() {
    return new nodes.Selector(this.next.val, this.block);
  },
  
  get variable() {
    var name = this.next.val;
    if (this.accept('=')) {
      this.lexer.isSelector = false;
      switch (this.peek.type) {
        case 'unit':
        case 'color':
          var tok = new nodes.Variable(name, this.next.val);
          this.lexer.isSelector = true;
          return tok;
        default:
          throw new Error('invalid right-side operand in assignment, got "' + this.peek.inspect() + '"');
      }
    }
    return new nodes.Variable(name);
  }
};
