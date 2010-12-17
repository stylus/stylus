
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
      var stmt = this.statement;
      // TODO: abstract
      if (!stmt) throw new Error('unexpected token "' + this.peek.type + '" '
        + (undefined == this.peek.val
          ? ''
          : this.peek.toString()) + ', not allowed at the root level');
      block.push(stmt);
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
      throw new Error('expected ' + type + ', got ' + this.peek);
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
      var stmt = this.statement;
      if (!stmt) {
        if (this.allowBlockExpressions) {
          stmt = this.expression
        } else {
          // TODO: abstract
          if (!stmt) throw new Error('unexpected token "' + this.peek.type + '" '
            + (undefined == this.peek.val
              ? ''
              : this.peek.toString()) + ' in block');
        }
      }
      block.push(stmt);
    }
    this.expect('outdent');
    return block;
  },
  
  /**
   * property expression
   */

  get property() {
    var name = this.expect('property').val
      , prop = new nodes.Property(name);

    this.lexer.isSelector = false;
    prop.expr = this.expression;
    if (prop.expr.isEmpty) throw new Error('property "' + name + '" expects an expression, got "' + this.peek + '"');
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
   *   variable 'assign' expression
   * | function
   */
  
  get variable() {
    var name = this._name = this.expect('variable').val.name;
    if (this.accept('assign')) {
      this.lexer.isSelector = false;
      var expr = this.expression;
      if (expr.isEmpty) throw new Error('invalid right-side operand in assignment, got "' + this.peek + '"');
      var tok = new nodes.Variable(name, expr);
      this.lexer.isSelector = true;
      return tok;
    }
    return this.function;
  },
  
  /**
   *   variable '(' params ')' block
   * | variable
   */
  
  get function() {
    var name = this._name;
    if (this.accept('(')) {
      var params = this.params;
      console.log(this.params);
      this.expect(')');
      this.allowBlockExpressions = true;
      var body = this.block;
      this.allowBlockExpressions = false;
      var fn = new nodes.Function(name, params, body);
      return new nodes.Variable(name, fn);
    }
    return new nodes.Variable(name);
  },
  
  /**
   * (variable (',' variable)*)?
   */
  
  get params() {
    var node
      , params = new nodes.Params;
    while (node = this.accept('variable')) {
      params.push(node);
    }
    return params;
  },
  
  /**
   * additive
   */

  get expression() {
    var node
      , expr = new nodes.Expression;
    while (node = this.additive) expr.push(node);
    return expr;
  },

  /**
   * multiplicative (('+' | '-') multiplicative)*
   */
  
  get additive() {
    var op
      , node = this.multiplicative;
    while ((op = this.accept('+')) || (op = this.accept('-'))) {
      node = new nodes.BinOp(op.type, node, this.multiplicative);
    }
    return node;
  },
  
  /**
   * primary (('*' | '/') primary)*
   */
  
  get multiplicative() {
    var op
      , node = this.primary;
    while ((op = this.accept('*')) || (op = this.accept('/'))) {
      node = new nodes.BinOp(op.type, node, this.primary);
    }
    return node;
  },
  
  /**
   *   unit
   * | color
   * | string
   * | variable
   * | keyword
   * | '(' expression ')'
   */

  get primary() {
    if (this.accept('(')) {
      var expr = this.expression;
      this.expect(')');
      return expr;
    }
    
    switch (this.peek.type) {
      case 'unit':
      case 'color':
      case 'string':
      case 'keyword':
      case 'variable':
        return this.next.val;
    }
  }
};
