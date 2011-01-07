
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
  this.str = nodes.source = str;
  this.filename = options.filename || 'stylus';
  this.lexer = new Lexer(str, options);
  this.root = options.root || new nodes.Root;
  this.state = ['root'];
};

/**
 * Parser prototype.
 */

Parser.prototype = {
  
  /**
   * Return current state.
   *
   * @return {String}
   * @api private
   */
  
  get currentState() {
    return this.state[this.state.length - 1];
  },
  
  /**
   * Parse the input, then return the root node.
   *
   * @return {Node}
   * @api private
   */
  
  parse: function(){
    var block = this.parent = this.root;
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
    // TODO: remove .val from ops
    if (val.trim() == type.trim()) val = '';
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
   *    ident
   *  | selector
   *  | literal
   *  | charset
   *  | import
   *  | expression
   */
  
  get statement() {
    var type = this.peek.type;
    switch (type) {
      case 'selector':
      case 'literal':
      case 'charset':
      case 'import':
      case 'ident':
        return this[type];
      default:
        // Contextual selectors
        switch (this.currentState) {
          case 'root':
          case 'selector':
          case 'function body':
            switch (type) {
              case '~':
              case '+':
              case '>':
              case '<':
              case '*':
                return this.selector;
            }
        }

        // Expression fallback
        var expr = this.expression;
        if (expr.isEmpty) this.error('unexpected {peek}');
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
    return new nodes.Import(this.expect('string').val.val);
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
   *   ident
   * | assignment
   * | function
   * | property
   * | selector
   */
  
  get ident() {
    var la = this.lookahead(2).type
      , cyclic = this._cyclic;

    switch (la) {
      // Function definition or call
      case '(':
        return this.function;
      // Assignment
      case '=':
      case '?=':
        return this.assignment;
      // Operation
      // TODO: cleanup / abstract
      case '-':
      case '+':
      case '/':
      case '*':
      case '%':
      case '**':
      case 'and':
      case 'or':
      case '&&':
      case '||':
      case '>':
      case '<':
      case '>=':
      case '<=':
      case '==':
      case '?':
      case 'is a':
      case 'is defined':
        if (cyclic) {
          this._cyclic = false;
          return this.next.val;
        } else {
          this._cyclic = true;
          // Check state to see if we
          // are operating on an ident
          // or have an unary op on the prop expr
          return 'selector' == this.currentState
            ? this.property
            : this.expression;
        }
      // Selector or property
      default:
        switch (this.currentState) {
          case 'root':
            return this.selector;
          case 'selector':
          case 'function body':
            return this.property;
          case 'expression':
          case 'assignment':
          case 'property value':
            return this.next.val;
        }
    }
  },
  
  /**
   * property expression
   */

  get property() {
    var name = this.expect('ident').val.name
      , prop = new nodes.Property(name);

    this.state.push('property value');
    prop.expr = this.list;
    this.state.pop();
    if (prop.expr.isEmpty) this.error('property "' + name + '" expects an expression, got {peek}');
    return prop;
  },
  
  /**
   *   selector ',' selector
   * | selector newline selector
   * | selector block
   */

  get selector() {
    var tok
      , arr
      , set = new nodes.RuleSet;

    do {
      arr = [];
      // Selector candidates,
      // stitched together to
      // form a selector.
      while (tok =
           this.accept('ident')
        || this.accept('string')
        || this.accept('selector')
        || this.accept('(')
        || this.accept(')')
        || this.accept('+')
        || this.accept('-')
        || this.accept('*')
        || this.accept('<')
        || this.accept('>')
        || this.accept('>')
        || this.accept('=')
        || this.accept('~')) {
        switch (tok.type) {
          case 'ident':
            arr.push(tok.val.name);
            break;
          case 'string':
            arr.push(tok.val.toString());
            break;
          default:
            arr.push(tok.val);
        }
      }
      set.push(new nodes.Selector(arr.join(' ')));
    } while (this.accept(',') || this.accept('newline'));

    this.state.push('selector');
    set.setBlock(this.block);
    this.state.pop();

    return set;
  },
  
  /**
   * ident ('=' | '?=') expression
   */
  
  get assignment() {
    var name = this.expect('ident').val.name
      , op = this.accept('=') || this.accept('?=');

    this.state.push('assignment');
    var expr = this.list;
    if (expr.isEmpty) this.error('invalid right-hand side operand in assignment, got {peek}')
    var node = new nodes.Ident(name, expr);
    this.state.pop();

    // Conditional assignment
    if ('?=' == op) {
      var defined = new nodes.BinOp('is defined', node)
        , lookup = new nodes.Ident(name);
      node = new nodes.Ternary(defined, lookup, node);
    }
    
    return node;
  },
  
  /**
   *   ident '(' params ')' block
   * | ident '(' expression ')'
   */
  
  get function() {
    var ident = this.expect('ident').val
      , name = this._name = ident.name
      , tok
      , i = 1
      , parens = 1;
    
    this.expect('(');

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

    return new nodes.Ident(name);
  },
  
  /**
   * ident '(' expression ')'
   */
  
  get functionCall() {
    this.state.push('function arguments');
    var name = this._name
      , args = this.list;
    this.expect(')');
    this.state.pop();
    return new nodes.Call(name, args);
  },
  
  /**
   * ident '(' params ')' block
   */
  
  get functionDefinition() {
    // Params
    this.state.push('function params');
    var name = this._name
      , params = this.params;
    this.expect(')');
    this.state.pop();

    // Body
    this.state.push('function body');
    var fn = new nodes.Function(name, params, this.block);
    this.state.pop();
    return new nodes.Ident(name, fn);
  },
  
  /**
   * (ident (',' ident ('=' expression)?)*)?
   */
  
  get params() {
    var tok
      , params = new nodes.Params;
    while (tok = this.accept('ident')) {
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
    this.state.push('expression');
    while (node = this.ternary) {
      if (!node) this.error('unexpected token {peek} in expression');
      expr.push(node);
    }
    this.state.pop();
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
      case 'literal':
      case 'boolean':
        return this.next.val;
      case 'ident':
        return this.ident;
    }
  }
};
