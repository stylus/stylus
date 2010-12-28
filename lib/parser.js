
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
  this.filename = options.filename || 'stylus';
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
    var tok = this.lexer.next;
    nodes.lineno = tok.lineno;
    return tok;
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
   *  | literal
   *  | charset
   *  | import
   *  | expression
   */
  
  get statement() {
    var type = this.peek.type;
    switch (type) {
      case 'property':
      case 'selector':
      case 'literal':
      case 'charset':
      case 'import':
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
   * import string
   */
   
  get import() {
    this.expect('import');
    var path = this.expect('string');
    console.log(this.paths);
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
   * charset string
   */
  
  get charset() {
    this.expect('charset');
    var str = this.expect('string').val;
    return new nodes.Charset(str);
  },
  
  /**
   * literal
   */
  
  get literal() {
    return this.expect('literal').val;
  },
  
  /**
   *   selector ',' selector
   * | selector newline selector
   * | selector block
   */

  get selector() {
    var node
      , set = new nodes.RuleSet;

    do {
      node = new nodes.Selector(this.expect('selector').val);
      set.push(node);
    } while (this.accept(',') || this.accept('newline'));

    set.setBlock(this.block);

    return set;
  },
  
  /**
   *   variable ('=' | '?=') expression
   * | function
   */
  
  get variable() {
    var op
      , name = this._name = this.expect('variable').val.name;
    if (op = this.accept('=') || this.accept('?=')) {
      this.lexer.isSelector = false;
      var expr = this.list;
      if (expr.isEmpty) this.error('invalid right-hand side operand in assignment, got {peek}')
      var node = new nodes.Variable(name, expr);
      this.lexer.isSelector = true;

      // Conditional assignment
      if ('?=' == op) {
        var defined = new nodes.BinOp('is defined', node)
          , lookup = new nodes.Variable(name);
        node = new nodes.Ternary(defined, lookup, node);
      }
      
      return node;
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

      this.lexer.isSelector = false;

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
      
      this.lexer.isSelector = true;

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
    var name = this._name
      , params = this.params;
    this.expect(')');
    var fn = new nodes.Function(name, params, this.block);
    return new nodes.Variable(name, fn);
  },
  
  /**
   * (variable (',' variable ('=' expression)?)*)?
   */
  
  get params() {
    var tok
      , params = new nodes.Params;
    while (tok = this.accept('variable')) {
      params.push(tok.val);
      if (this.accept('=')) {
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
   * defined+
   */

  get expression() {
    var node
      , expr = new nodes.Expression;
    while (node = this.ternary) {
      if (!node) this.error('unexpected token {peek} in expression');
      expr.push(node);
    }
    return expr;
  },
  
  /**
   * logical ('?' expression : expression)?
   */
  
  get ternary() {
    var node = this.logical;
    if (this.accept('?')) {
      var trueExpr = this.expression;
      this.expect(':');
      var falseExpr = this.expression;
      node = new nodes.Ternary(node, trueExpr, falseExpr);
    }
    return node;
  },
  
  /**
   * defined (('&&' | '||') defined)*
   */
  
  get logical() {
    var op
      , node = this.defined;
    while (op = this.accept('&&') || this.accept('||')) {
      node = new nodes.BinOp(op.type, node, this.defined);
    }
    return node;
  },
  
  /**
   *    equality 'is defined'
   *  | equality
   */
  
  get defined() {
    var node = this.equality;
    if (this.accept('is defined')) {
      node = new nodes.BinOp('is defined', node);
    }
    return node;
  },
  
  /**
   * typecheck (('==' | '>=' | '<=' | '>' | '<') typecheck)*
   */
  
  get equality() {
    var op
      , node = this.typecheck;
    while (op = 
         this.accept('==')
      || this.accept('>=')
      || this.accept('<=')
      || this.accept('<')
      || this.accept('>')
      ) {
      node = new nodes.BinOp(op.type, node, this.typecheck);
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
    while (op = this.accept('+') || this.accept('-')) {
      node = new nodes.BinOp(op.type, node, this.multiplicative);
    }
    return node;
  },
  
  /**
   * unary (('**' | '*' | '/' | '%') unary)*
   */
  
  get multiplicative() {
    var op
      , node = this.unary;
    while (op =
         this.accept('**')
      || this.accept('*')
      || this.accept('/')
      || this.accept('%')) {
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
   * | literal
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
      case 'literal':
      case 'boolean':
        return this.next.val;
      case 'variable':
        return this.variable;
    }
  }
};
