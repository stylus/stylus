
/*!
 * CSS - Parser
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Lexer = require('./lexer')
  , nodes = require('./nodes')
  , inspect = require('sys').inspect;

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
  this.lexer.isSelector = true;
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
    var block = this.root = new nodes.Root;
    while ('eos' != this.peek.type) {
      if (this.accept('newline')) continue;
      block.push(this.statement);
    }
    return block;
  },
  
  /**
   * Accept the given token `type`, and return it,
   * otherwise return `undefined`.
   *
   * @param {String} type
   * @return {Token}
   * @api private
   */

  accept: function(type){
    if (type == this.peek.type) {
      return this.next;
    }
  },

  /**
   * Expect token `type` and return it, throw otherwise.
   *
   * @param {String} type
   * @return {Token}
   * @api private
   */

  expect: function(type){
    if (type != this.peek.type) {
      throw new Error('expected ' + type + ', got ' + this.peek.type);
    }
    return this.next;
  },
  
  /**
   * Get the next token.
   *
   * @return {Token}
   * @api private
   */
  
  get next() {
    return this.lexer.next;
  },
  
  /**
   * Peek with lookahead(1).
   *
   * @return {Token}
   * @api private
   */
  
  get peek() {
    return this.lexer.peek;
  },
  
  /**
   *    variable
   *  | property
   *  | selector
   */
  
  get statement() {
    var type = this.peek.type;
    switch (type) {
      case 'variable':
      case 'property':
      case 'selector':
        return this[type];
      default:
        // TODO: refactor
        throw new Error('invalid token "' + type + '" ' + inspect(this.peek.val));
    }
  },
  
  /**
   * indent (!outdent)+ outdent
   */

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
  
  /**
   * property (unit | color)
   */

  get property() {
    var tok
      , name = this.expect('property').val
      , prop = new nodes.Property(name);

    this.lexer.isSelector = false;
    while (~['unit', 'color', 'keyword', 'string', 'variable'].indexOf(this.peek.type)) {
      prop.push(this.next.val);
    }
    this.lexer.isSelector = true;

    return prop;
  },
  
  /**
   * selector
   */

  get selector() {
    return new nodes.Selector(this.expect('selector').val, this.block);
  },
  
  /**
   * variable ('assign' expression)?
   */
  
  get variable() {
    var name = this.expect('variable').val.name;
    if (this.accept('assign')) {
      this.lexer.isSelector = false;
      var expr = this.expression;
      if (!expr) throw new Error('invalid right-side operand in assignment, got "' + this.peek.type + '"');
      var tok = new nodes.Variable(name, expr);
      this.lexer.isSelector = true;
      return tok;
    }
    return new nodes.Variable(name);
  },
  
  /**
   *   unit
   * | color
   * | variable
   */
  
  get expression() {
    var type = this.peek.type;
    switch (type) {
      case 'unit':
      case 'color':
      case 'variable':
        return this.next.val;
    }
  }
};
