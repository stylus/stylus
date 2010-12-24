
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
    var block = this.root = this.parent = new nodes.Root;
    while ('eos' != this.peek.type) {
      if (this.accept('newline')) continue;
      var stmt = this.statement;
      if (!stmt) this.error('unexpected token {peek}, not allowed at the root level');
      block.push(stmt);
    }
    return block;
  },
  
  /**
   * Throw an `Error` with the given `msg`.
   *
   * @param {String} msg
   * @api private
   */
  
  error: function(msg){
    var type = this.peek.type
      , val = undefined == this.peek.val
        ? ''
        : ' ' + this.peek.toString();
    throw new Error(msg.replace('{peek}', type + val));
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
        var expr = this.expression;
        if (expr.isEmpty) this.error('unexpected {peek} in expression');
        return expr;
    }
  },
  
  /**
   * indent (!outdent)+ outdent
   */

  get block() {
    var block = this.parent = new nodes.Block(this.parent);
    this.expect('indent');
    while ('outdent' != this.peek.type) {
      if (this.accept('newline')) continue;
      var stmt = this.statement;
      if (!stmt) this.error('unexpected token {peek} in block');
      block.push(stmt);
    }
    this.expect('outdent');
    this.parent = block.parent;
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
    if (prop.expr.isEmpty) this.error('property "' + name + '" expects an expression, got {peek}');
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
      var expr = this.list;
      if (expr.isEmpty) this.error('invalid right-hand side operand in assignment, got {peek}')
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
      var tok
        , i = 1
        , parens = 1;

      // Lookahead and determine if we are dealing
      // with a function call or definition. Here
      // we pair parens to prevent false negatives
      out:
      while (tok = this.lookahead(i++)) {
        switch (tok.type) {
          case '(': ++parens; break;
          case ')': if (!--parens) break out;
        }
      }

      // Definition or call
      return 'indent' == this.lookahead(i).type
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
    while (this.accept(',')) {
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
   * typecheck+
   */

  get expression() {
    var node
      , expr = new nodes.Expression;
    while (node = this.equality) {
      if (!node) this.error('unexpected token {peek} in expression');
      expr.push(node);
    }
    return expr;
  },
  
  /**
   * defined (('==' | '>=' | '<=' | '>' | '<') defined)*
   */
  
  get equality() {
    var op
      , node = this.defined;
    while ((op = this.accept('=='))
      || (op = this.accept('>='))
      || (op = this.accept('<='))
      || (op = this.accept('<'))
      || (op = this.accept('>'))
      ) {
      node = new nodes.BinOp(op.type, node, this.defined);
    }
    return node;
  },
  
  /**
   *    typecheck 'is defined'
   *  | typecheck
   */
  
  get defined() {
    var node = this.typecheck;
    if (this.accept('is defined')) {
      node = new nodes.BinOp('is defined', node);
    }
    return node;
  },
  
  /**
   * additive ('is a' additive)*
   */
  
  get typecheck() {
    var op
      , node = this.additive;
    while (op = this.accept('is a')) {
      node = new nodes.BinOp(op.type, node, this.additive);
    }
    return node;
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
   * unary (('*' | '/') unary)*
   */
  
  get multiplicative() {
    var op
      , node = this.unary;
    while ((op = this.accept('*')) || (op = this.accept('/'))) {
      node = new nodes.BinOp(op.type, node, this.unary);
    }
    return node;
  },
  
  /**
   *   (('!' | '~' | '-' | '+') expression)+
   * | primary
   */
  
  get unary() {
    var op, node;
    while (op = 
         this.accept('!')
      || this.accept('~')
      || this.accept('-')
      || this.accept('+')) {
      node = new nodes.UnaryOp(op.type, node || this.expression);
    }
    return node || this.primary;
  },
  
  /**
   *   unit
   * | color
   * | string
   * | variable
   * | ident
   * | boolean
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
      case 'ident':
      case 'boolean':
        return this.next.val;
      case 'variable':
        return this.variable;
    }
  }
};
