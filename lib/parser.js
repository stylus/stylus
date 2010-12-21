
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
   * Lookahead `n` tokens.
   *
   * @param {Number} n
   * @return {Token}
   * @api private
   */
  
  lookahead: function(n){
    return this.lexer.lookahead(n);
  },
  
  /**
   *    variable
   *  | property
   *  | selector
   *  | expression
   */
  
  get statement() {
    var type = this.peek.type;
    switch (type) {
      case 'property':
      case 'selector':
        return this[type];
      default:
        return this.expression;
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
      // TODO: abstract
      if (!stmt) throw new Error('unexpected token "' + this.peek.type + '" '
        + (undefined == this.peek.val
          ? ''
          : this.peek.toString()) + ' in block');
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
    prop.expr = this.list;
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
   * | variable '(' expression ')'
   * | variable
   */
  
  get function() {
    var name = this._name;
    if (this.accept('(')) {
      // Lookahead and determine if we are dealing
      // with a function call or definition
      var i = 1;
      while (')' != this.lookahead(i++).type) ;
      var isFunction = 'indent' == this.lookahead(i).type;
      return isFunction
        ? this.functionDefinition
        : this.functionCall;
    }
    return new nodes.Variable(name);
  },
  
  /**
   * variable '(' expression ')'
   */
  
  get functionCall() {
    var name = this._name
      , args = this.list;
    this.expect(')');
    return new nodes.Call(name, args);
  },
  
  /**
   * variable '(' params ')' block
   */
  
  get functionDefinition() {
    var name = this._name;
    var params = this.params;
    this.expect(')');
    var fn = new nodes.Function(name, params, this.block);
    return new nodes.Variable(name, fn);
  },
  
  /**
   * (variable (',' variable (':' expression)?)*)?
   */
  
  get params() {
    var tok
      , params = new nodes.Params;
    while (tok = this.accept('variable')) {
      params.push(tok.val);
      if (this.accept('assign')) {
        tok.val.val = this.expression;
      }
      this.accept(',');
    }
    return params;
  },
 
  /**
   * expression (',' expression)*
   */

  get list() {
    var node = this.expression;
    while (',' == this.accept(',')) {
      if (node.isList) {
        list.push(this.expression);
      } else {
        var list = new nodes.Expression(true);
        list.push(node);
        list.push(this.expression);
        node = list;
      }
    }
    return node;
  }, 
  
  /**
   * additive
   */

  get expression() {
    var node
      , expr = new nodes.Expression;
    while (node = this.additive) {
      // TODO: abstract
      if (!node) throw new Error('unexpected token "' + this.peek.type + '" '
        + (undefined == this.peek.val
          ? ''
          : this.peek.toString()) + ' in expression');
      expr.push(node);
    }
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
        return this.next.val;
      case 'variable':
        return this.variable;
    }
  }
};
