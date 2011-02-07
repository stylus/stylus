
/*!
 * CSS - Lexer
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Token = require('./token')
  , nodes = require('./nodes');

/**
 * Operator aliases.
 */

var alias = {
    and: '&&'
  , or: '||'
};

/**
 * Numeric strings used for exceptions.
 */

var numberString = [, 'one', 'two'];

/**
 * Units.
 */

var units = [
    'em'
  , 'ex'
  , 'px'
  , 'mm'
  , 'cm'
  , 'in'
  , 'pt'
  , 'pc'
  , 'deg'
  , 'rad'
  , 'grad'
  , 'ms'
  , 's'
  , 'Hz'
  , 'kHz'
  , '%'].join('|');

/**
 * Unit RegExp.
 */

var unit = new RegExp('^(-)?(\\d+\\.\\d+|\\d+|\\.\\d+)(' + units + ')? *');

/**
 * Initialize a new `Lexer` with the given `str` and `options`.
 *
 * @param {String} str
 * @param {Object} options
 * @api private
 */

var Lexer = module.exports = function Lexer(str, options) {
  options = options || {};
  this.str = str.replace(/\r\n?/g, '\n').replace(/\t/g, '  ');
  this.stash = [];
  this.prevIndents = 0;
  this.lineno = 0;
};

/**
 * Lexer prototype.
 */

Lexer.prototype = {
  
  /**
   * Custom inspect.
   */
  
  inspect: function(){
    var tok
      , tmp = this.str
      , buf = [];
    while ('eos' != (tok = this.next).type) {
      buf.push(tok.inspect());
    }
    this.str = tmp;
    this.prevIndents = 0;
    return buf.concat(tok.inspect()).join('\n');
  },

  /**
   * Lookahead `n` tokens.
   *
   * @param {Number} n
   * @return {Object}
   * @api private
   */
  
  lookahead: function(n){
    var fetch = n - this.stash.length;
    while (fetch-- > 0) this.stash.push(this.advance);
    return this.stash[--n];
  },
  
  /**
   * Consume the given `len`.
   *
   * @param {Number|Array} len
   * @api private
   */

  skip: function(len){
    this.str = this.str.substr(Array.isArray(len)
      ? len[0].length
      : len);
  },

  /**
   * Fetch next token including those stashed by peek.
   *
   * @return {Token}
   * @api private
   */

  get next() {
    var tok = this.stashed || this.advance;
    switch (tok.type) {
      case 'newline':
      case 'selector':
      case 'indent':
        ++this.lineno;
    }
    tok.lineno = this.lineno;
    return tok;
  },

  /**
   * Fetch next token.
   *
   * @return {Token}
   * @api private
   */

  get advance() {
    return this.eos
      || this.null
      || this.sep
      || this.keyword
      || this.atrule
      || this.media
      || this.comment
      || this.newline
      || this.escaped
      || this.important
      || this.literal
      || this.function
      || this.brace
      || this.paren
      || this.color
      || this.string
      || this.unit
      || this.namedop
      || this.boolean
      || this.ident
      || this.op
      || this.space
      || this.selector;
  },

  /**
   * Lookahead a single token.
   *
   * @return {Token}
   * @api private
   */
  
  get peek() {
    return this.lookahead(1);
  },
  
  /**
   * Return the next possibly stashed token.
   *
   * @return {Token}
   * @api private
   */

  get stashed() {
    return this.stash.shift();
  },

  /**
   * EOS | trailing outdents.
   */

  get eos() {
    if (this.str.length) return;
    return --this.prevIndents < 0
      ? new Token('eos')
      : new Token('outdent');
  },

  /**
   * ';' ' '*
   */

  get sep() {
    var captures;
    if (captures = /^; */.exec(this.str)) {
      this.skip(captures);
      return new Token(';');
    }
  },
  
  /**
   * ' '+
   */

  get space() {
    var captures;
    if (captures = /^( +)/.exec(this.str)) {
      this.skip(captures);
      return new Token('space');
    }
  },
  
  /**
   * '\\' . ' '*
   */
   
  get escaped() {
    var captures;
    if (captures = /^\\(.) */.exec(this.str)) {
      var c = captures[1];
      this.skip(captures);
      return new Token('ident', new nodes.Literal(c));
    }
  },
  
  /**
   * '@css' ' '* '{' .* '}' ' '*
   */
  
  get literal() {
    // HACK attack !!!
    var captures;
    if (captures = /^@css *\{/.exec(this.str)) {
      this.skip(captures);
      var c
        , braces = 1
        , css = '';
      while (c = this.str[0]) {
        this.str = this.str.substr(1);
        switch (c) {
          case '{': ++braces; break;
          case '}': --braces; break;
        }
        css += c;
        if (!braces) break;
      }
      css = css.replace(/\s*}$/, '');
      return new Token('literal', new nodes.Literal(css));
    }
  },
  
  /**
   * '!important' ' '*
   */
  
  get important() {
    var captures;
    if (captures = /^!important */.exec(this.str)) {
      this.skip(captures);
      return new Token('ident', new nodes.Literal('!important'));
    }
  },
  
  /**
   * '{' | '}'
   */
  
  get brace() {
    var captures;
    if (captures = /^([{}])/.exec(this.str)) {
      this.skip(1);
      var brace = captures[1];
      return new Token(brace, brace);
    }
  },
  
  /**
   * '(' | ')' ' '*
   */
  
  get paren() {
    var captures;
    if (captures = /^([()]) */.exec(this.str)) {
      var paren = captures[1];
      this.skip(captures);
      if (')' == paren) this.isURL = false;
      return new Token(paren, paren);
    }
  },
  
  /**
   * 'null'
   */
  
  get null() {
    var captures;
    if (captures = /^(null)\b */.exec(this.str)) {
      this.skip(captures);
      return new Token('null', nodes.null);
    }
  },
  
  /**
   *   'if'
   * | 'else'
   * | 'unless'
   * | 'return'
   * | 'for'
   * | 'in'
   */
  
  get keyword() {
    var captures;
    if (captures = /^(return|if|else|unless|for|in)\b */.exec(this.str)) {
      var keyword = captures[1];
      this.skip(captures);
      return new Token(keyword, keyword);
    }
  },
  
  /**
   *   'not'
   * | 'and'
   * | 'or'
   * | 'is a'
   * | 'is defined'
   */
  
  get namedop() {
    var captures;
    if (captures = /^(not|and|or|is a|is defined)\b( *)/.exec(this.str)) {
      var op = captures[1];
      this.skip(captures);
      op = alias[op] || op;
      var tok = new Token(op, op);
      tok.space = captures[2];
      return tok;
    }
  },
  
  /**
   *   ','
   * | '+'
   * | '+='
   * | '-'
   * | '-='
   * | '*'
   * | '*='
   * | '/'
   * | '/='
   * | '%'
   * | '%='
   * | '**'
   * | '!'
   * | '&'
   * | '&&'
   * | '||'
   * | '>'
   * | '>='
   * | '<'
   * | '<='
   * | '='
   * | '=='
   * | '!='
   * | '!'
   * | '~'
   * | '?='
   * | '?'
   * | ':'
   * | '['
   * | ']'
   * | '..'
   * | '...'
   */
  
  get op() {
    var captures;
    if (captures = /^([.]{2,3}|&&|\|\||[!<>=?]=|\*\*|[-+*\/%]=?|[,=?:!~<>&\[\]])( *)/.exec(this.str)) {
      var op = captures[1];
      this.skip(captures);
      op = alias[op] || op;
      var tok = new Token(op, op);
      tok.space = captures[2];
      return tok;
    }
  },

  /**
   * '@media' ([^{\n]+)
   */
  
  get media() {
    var captures;
    if (captures = /^@media *([^{\n]+)/.exec(this.str)) {
      this.skip(captures);
      return new Token('media', captures[1].trim());
    }
  },
  
  /**
   * '@' ('import' | 'keyframes' | 'charset' | 'page')
   */
  
  get atrule() {
    var captures;
    if (captures = /^@(import|keyframes|charset|page) */.exec(this.str)) {
      this.skip(captures);
      return new Token(captures[1]);
    }
  },

  /**
   * '//' *
   */
  
  get comment() {
    // Single line
    if ('/' == this.str[0] && '/' == this.str[1]) {
      var end = this.str.indexOf('\n');
      if (-1 == end) end = this.str.length;
      this.skip(end);
      return this.advance;
    }

    // Multi-line
    if ('/' == this.str[0] && '*' == this.str[1]) {
      var end = this.str.indexOf('*/');
      if (-1 == end) end = this.str.length;
      var str = this.str.substr(0, end + 2)
        , lines = str.split('\n').length - 1;
      this.lineno += lines;
      this.skip(end + 2);
      return this.allowComments
        ? new Token('comment', str)
        : this.advance;
    }
  },

  /**
   * 'true' | 'false'
   */
  
  get boolean() {
    var captures;
    if (captures = /^(true|false)\b( *)/.exec(this.str)) {
      var val = 'true' == captures[1]
        ? nodes.true
        : nodes.false;
      this.skip(captures);
      var tok = new Token('boolean', val);
      tok.space = captures[2];
      return tok;
    }
  },

  /**
   * -?[a-zA-Z] [-\w\d]* '('
   */
  
  get function() {
    var captures;
    if (captures = /^(-?[a-zA-Z][-\w\d]*)\(( *)/.exec(this.str)) {
      var name = captures[1];
      this.skip(captures);
      this.isURL = 'url' == name;
      var tok = new Token('function', new nodes.Ident(name));
      tok.space = captures[2];
      return tok;
    } 
  },

  /**
   * -?[a-zA-Z] [-\w\d]*
   */
  
  get ident() {
    var captures;
    if (captures = /^(-?[a-zA-Z][-\w\d]*)/.exec(this.str)) {
      var name = captures[1];
      this.skip(captures);
      return new Token('ident', new nodes.Ident(name));
    }
  },
  
  /**
   * '\n' ' '+
   */

  get newline() {
    var captures;
    if (captures = /^\n( *)/.exec(this.str)) {
      var tok
        , spaces = captures[1].length
        , indents = spaces / 2;

      this.skip(captures);

      // Reset state
      this.isVariable = false;
      
      // Blank line
      if ('\n' == this.str[0]) {
        ++this.lineno;
        return this.advance;
      }

      // To few spaces
      if (0 != spaces % 2) {
        var str = 1 == spaces ? 'space' : 'spaces'
          , spaces = numberString[spaces] || spaces;
        throw new Error('Invalid indentation, got ' + spaces + ' ' + str + ' and expected multiple of two');
      // To many spaces
      } else if (indents > this.prevIndents + 1) {
        var str = 1 == spaces ? 'space' : 'spaces'
          , expected = 2 * (this.prevIndents * 2) || 2
          , expected = numberString[expected] || expected
          , spaces = numberString[spaces] || spaces;
        throw new Error('Invalid indentation, got ' + spaces + ' ' + str + ' and expected ' + expected);
      // Outdent
      } else if (indents < this.prevIndents) {
        var n = this.prevIndents - indents;
        while (--n) this.stash.push(new Token('outdent'));
        this.prevIndents = indents;
        tok = new Token('outdent');
      // Indent
      } else if (indents != this.prevIndents) {
        this.prevIndents = indents;
        tok = new Token('indent');
      // Newline
      } else {
        tok = new Token('newline');
      }

      return tok;
    }
  },

  /**
   * '-'? (digit+ | digit* '.' digit+) unit
   */

  get unit() {
    var captures;
    if (captures = unit.exec(this.str)) {
      this.skip(captures);
      var n = parseFloat(captures[2]);
      if ('-' == captures[1]) n = -n;
      var node = new nodes.Unit(n, captures[3]);
      return new Token('unit', node);
    }
  },

  /**
   * '"' [^"]+ '"' | "'"" [^']+ "'"
   */

  get string() {
    var captures;

    // url() special case
    if (this.isURL && (captures = /^([^'"][^)]+) */.exec(this.str))) {
      this.skip(captures);
      return new Token('string', new nodes.String(captures[1]));
    }

    // Regular string
    if (captures = /^("[^"]*"|'[^']*') */.exec(this.str)) {
      var str = captures[1];
      this.skip(captures);
      return new Token('string', new nodes.String(str.slice(1,-1)));
    }
  },

  /**
   * #nnnnnn | #nnn
   */

  get color() {
    return this.hex6 || this.hex3;
  },
  
  /**
   * #nnn
   */
  
  get hex3() {
    var captures;
    if (captures = /^#([a-f-A-F0-9]{3}) */.exec(this.str)) {
      this.skip(captures);
      var rgb = captures[1]
        , r = parseInt(rgb[0] + rgb[0], 16)
        , g = parseInt(rgb[1] + rgb[1], 16)
        , b = parseInt(rgb[2] + rgb[2], 16);
      return new Token('color', new nodes.Color(r, g, b, 1)); 
    }
  },
  
  /**
   * #nnnnnn
   */
  
  get hex6() {
    var captures;
    if (captures = /^#([a-f-A-F0-9]{6}) */.exec(this.str)) {
      this.skip(captures);
      var rgb = captures[1]
        , r = parseInt(rgb.substr(0, 2), 16)
        , g = parseInt(rgb.substr(2, 2), 16)
        , b = parseInt(rgb.substr(4, 2), 16);
      return new Token('color', new nodes.Color(r, g, b, 1)); 
    }
  },
  
  /**
   * [^\n,;]+
   */
  
  get selector() {
    var captures;
    if (captures = /^[^{\n,]+/.exec(this.str)) {
      var selector = captures[0];
      this.skip(captures);
      return new Token('selector', selector);
    }
  }
};
