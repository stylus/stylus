
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
    not: '!'
  , and: '&&'
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

var unit = new RegExp('^(\\d+\\.\\d+|\\d+|\\.\\d+)(' + units + ')? *');

/**
 * Color names.
 */

var colors = {
    aliceblue: [240, 248, 255]
  , antiquewhite: [250, 235, 215]
  , aqua: [0, 255, 255]
  , aquamarine: [127, 255, 212]
  , azure: [240, 255, 255]
  , beige: [245, 245, 220]
  , bisque: [255, 228, 196]
  , black: [0, 0, 0]
  , blanchedalmond: [255, 235, 205]
  , blue: [0, 0, 255]
  , blueviolet: [138, 43, 226]
  , brown: [165, 42, 42]
  , burlywood: [222, 184, 135]
  , cadetblue: [95, 158, 160]
  , chartreuse: [127, 255, 0]
  , chocolate: [210, 105, 30]
  , coral: [255, 127, 80]
  , cornflowerblue: [100, 149, 237]
  , cornsilk: [255, 248, 220]
  , crimson: [220, 20, 60]
  , cyan: [0, 255, 255]
  , darkblue: [0, 0, 139]
  , darkcyan: [0, 139, 139]
  , darkgoldenrod: [184, 132, 11]
  , darkgray: [169, 169, 169]
  , darkgreen: [0, 100, 0]
  , darkgrey: [169, 169, 169]
  , darkkhaki: [189, 183, 107]
  , darkmagenta: [139, 0, 139]
  , darkolivegreen: [85, 107, 47]
  , darkorange: [255, 140, 0]
  , darkorchid: [153, 50, 204]
  , darkred: [139, 0, 0]
  , darksalmon: [233, 150, 122]
  , darkseagreen: [143, 188, 143]
  , darkslateblue: [72, 61, 139]
  , darkslategray: [47, 79, 79]
  , darkslategrey: [47, 79, 79]
  , darkturquoise: [0, 206, 209]
  , darkviolet: [148, 0, 211]
  , deeppink: [255, 20, 147]
  , deepskyblue: [0, 191, 255]
  , dimgray: [105, 105, 105]
  , dimgrey: [105, 105, 105]
  , dodgerblue: [30, 144, 255]
  , firebrick: [178, 34, 34]
  , floralwhite: [255, 255, 240]
  , forestgreen: [34, 139, 34]
  , fuchsia: [255, 0, 255]
  , gainsboro: [220, 220, 220]
  , ghostwhite: [248, 248, 255]
  , gold: [255, 215, 0]
  , goldenrod: [218, 165, 32]
  , gray: [128, 128, 128]
  , green: [0, 128, 0]
  , greenyellow: [173, 255, 47]
  , grey: [128, 128, 128]
  , honeydew: [240, 255, 240]
  , hotpink: [255, 105, 180]
  , indianred: [205, 92, 92]
  , indigo: [75, 0, 130]
  , ivory: [255, 255, 240]
  , khaki: [240, 230, 140]
  , lavender: [230, 230, 250]
  , lavenderblush: [255, 240, 245]
  , lawngreen: [124, 252, 0]
  , lemonchiffon: [255, 250, 205]
  , lightblue: [173, 216, 230]
  , lightcoral: [240, 128, 128]
  , lightcyan: [224, 255, 255]
  , lightgoldenrodyellow: [250, 250, 210]
  , lightgray: [211, 211, 211]
  , lightgreen: [144, 238, 144]
  , lightgrey: [211, 211, 211]
  , lightpink: [255, 182, 193]
  , lightsalmon: [255, 160, 122]
  , lightseagreen: [32, 178, 170]
  , lightskyblue: [135, 206, 250]
  , lightslategray: [119, 136, 153]
  , lightslategrey: [119, 136, 153]
  , lightsteelblue: [176, 196, 222]
  , lightyellow: [255, 255, 224]
  , lime: [0, 255, 0]
  , limegreen: [50, 205, 50]
  , linen: [250, 240, 230]
  , magenta: [255, 0, 255]
  , maroon: [128, 0, 0]
  , mediumaquamarine: [102, 205, 170]
  , mediumblue: [0, 0, 205]
  , mediumorchid: [186, 85, 211]
  , mediumpurple: [147, 112, 219]
  , mediumseagreen: [60, 179, 113]
  , mediumslateblue: [123, 104, 238]
  , mediumspringgreen: [0, 250, 154]
  , mediumturquoise: [72, 209, 204]
  , mediumvioletred: [199, 21, 133]
  , midnightblue: [25, 25, 112]
  , mintcream: [245, 255, 250]
  , mistyrose: [255, 228, 225]
  , moccasin: [255, 228, 181]
  , navajowhite: [255, 222, 173]
  , navy: [0, 0, 128]
  , oldlace: [253, 245, 230]
  , olive: [128, 128, 0]
  , olivedrab: [107, 142, 35]
  , orange: [255, 165, 0]
  , orangered: [255, 69, 0]
  , orchid: [218, 112, 214]
  , palegoldenrod: [238, 232, 170]
  , palegreen: [152, 251, 152]
  , paleturquoise: [175, 238, 238]
  , palevioletred: [219, 112, 147]
  , papayawhip: [255, 239, 213]
  , peachpuff: [255, 218, 185]
  , peru: [205, 133, 63]
  , pink: [255, 192, 203]
  , plum: [221, 160, 203]
  , powderblue: [176, 224, 230]
  , purple: [128, 0, 128]
  , red: [255, 0, 0]
  , rosybrown: [188, 143, 143]
  , royalblue: [65, 105, 225]
  , saddlebrown: [139, 69, 19]
  , salmon: [250, 128, 114]
  , sandybrown: [244, 164, 96]
  , seagreen: [46, 139, 87]
  , seashell: [255, 245, 238]
  , sienna: [160, 82, 45]
  , silver: [192, 192, 192]
  , skyblue: [135, 206, 235]
  , slateblue: [106, 90, 205]
  , slategray: [119, 128, 144]
  , slategrey: [119, 128, 144]
  , snow: [255, 255, 250]
  , springgreen: [0, 255, 127]
  , steelblue: [70, 130, 180]
  , tan: [210, 180, 140]
  , teal: [0, 128, 128]
  , thistle: [216, 191, 216]
  , tomato: [255, 99, 71]
  , turquoise: [64, 224, 208]
  , violet: [238, 130, 238]
  , wheat: [245, 222, 179]
  , white: [255, 255, 255]
  , whitesmoke: [245, 245, 245]
  , yellow: [255, 255, 0]
  , yellowgreen: [154, 205, 5]
};

/**
 * Color RegExp.
 */

var color = new RegExp('^(' + Object.keys(colors).join('|') + ')(\\()? *') 

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
  this.filename = options.filename || 'stylus';
  this.stash = [];
  this.prevIndents = 0;
  this.lineno = 1;
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
      || this.comment
      || this.newline
      || this.escaped
      || this.important
      || this.literal
      || this.paren
      || this.import
      || this.color
      || this.charset
      || this.string
      || this.unit
      || this.op
      || this.boolean
      || this.ident
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
   * Check current property state.
   *
   * @return {Boolean}
   * @api private
   */

  get isProperty() {
    return 1 == this.prevIndents % 2;
  },

  /**
   * EOS | trailing outdents.
   */

  get eos() {
    if (this.str.length) return;
    return 0 == --this.prevIndents
      ? new Token('outdent')
      : new Token('eos');
  },
  
  /**
   * '\\' . ' '*
   */
   
  get escaped() {
    var captures;
    if (captures = /^\\(.) */.exec(this.str)) {
      var c = captures[1];
      this.skip(captures);
      return new Token('ident', new nodes.Ident(c));
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
      return new Token('ident', new nodes.Ident('!important'));
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
      return new Token(paren);
    }
  },
  
  /**
   *   ','
   * | '+'
   * | '-'
   * | '*'
   * | '/'
   * | '%'
   * | '**'
   * | '!'
   * | 'not'
   * | 'and'
   * | 'or'
   * | '&&'
   * | '||'
   * | '>'
   * | '>='
   * | '<'
   * | '<='
   * | '='
   * | '=='
   * | '!'
   * | '~'
   * | '?='
   * | '?'
   * | ':'
   * | 'is a'
   * | 'is defined'
   */
  
  get op() {
    var captures;
    if (captures = /^(not|and|or|&&|\|\||is a|is defined|[<>=?]=|\*\*|[-,=?:!~+<>*\/%]) */.exec(this.str)) {
      var op = captures[1];
      this.skip(captures);
      return new Token(alias[op] || op);
    }
  },
  
  /**
   * @import
   */
  
  get import() {
    var captures;
    if (captures = /^@import */.exec(this.str)) {
      this.str = this.str.substr(captures[0].length);
      return new Token('import');
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
      var lines = this.str.substr(0, end).split('\n').length - 1;
      this.lineno += lines;
      this.skip(end + 2);
      return this.advance;
    }
  },

  /**
   * 'true' | 'false'
   */
  
  get boolean() {
    var captures;
    if (captures = /^(true|false) */.exec(this.str)) {
      var val = 'true' == captures[1]
        ? nodes.true
        : nodes.false;
      this.skip(captures);
      return new Token('boolean', val);
    }
  },
  
  /**
   * ident
   */
  
  get ident() {
    var captures;
    // Root assignment special case
    // we resort to hacks like this
    // because the alternative is to
    // account for a variety of nodes,
    // and then reconstruct the selector
    // ... which is lame
    if (captures = /^( *([A-Za-z-]+) *)\??=/.exec(this.str)) {
      console.log(captures);
      var name = captures[2];
      this.skip(captures[1].length);
      return new Token('ident', new nodes.Ident(name));
    }

    // Function definition special-case
    if (captures = /^ *([A-Za-z-]+)\(/.exec(this.str)) {
      var name = captures[1];
      this.skip(captures[0].length - 1);
      return new Token('ident', new nodes.Ident(name));
    }
    
    if (this.isSelector) return;
    if (captures = /^([A-Za-z-]+) */.exec(this.str)) {
      var name = captures[1];
      this.skip(captures);
      this.isURL = 'url' == name;
      return new Token('ident', new nodes.Ident(name));
    }
  },
  
  /**
   * '@charset'
   */
  
  get charset() {
    var captures;
    if (captures = /^@charset */.exec(this.str)) {
      this.skip(captures);
      return new Token('charset');
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
          , expected = 2 * this.prevIndents || 2
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
   * (digit+ | digit* '.' digit+) unit
   */

  get unit() {
    var captures;
    if (captures = unit.exec(this.str)) {
      this.skip(captures);
      return new Token('unit', new nodes.Unit(parseFloat(captures[1]), captures[2]));
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
   * #nnnnnn | #nnn | colorString
   */

  get color() {
    return this.hex6
      || this.hex3
      || this.colorString;
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
   * Color string.
   */
  
  get colorString() {
    var captures;
    if (captures = color.exec(this.str)) {
      var name = captures[1]
        , rgb = colors[name]
        , fn = captures[2];
      if (fn) return;
      this.skip(captures);
      return new Token('color', new nodes.Color(rgb[0], rgb[1], rgb[2], 1));
    }
  },
  
  /**
   * [^\n,]+
   */
  
  get selector() {
    var captures;
    if (captures = /^[^\n,]+/.exec(this.str)) {
      var selector = captures[0];
      this.skip(captures);
      return new Token('selector', selector);
    }
  }
};
