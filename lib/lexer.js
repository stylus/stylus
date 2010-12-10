
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
 * Initialize a new `Lexer` with the given `str` and `options`.
 *
 * @param {String} str
 * @param {Object} options
 * @api private
 */

var Lexer = module.exports = function Lexer(str, options) {
  options = options || {};
  this.str = str;
  this.filename = options.filename || 'css';
  this.stash = [];
  this.prevIndents = 0;
};

/**
 * Lexer prototype.
 */

Lexer.prototype = {
  get next() {
    return this.stashed
      || this.newline
      || this.color
      || this.id
      || this.eos;
  },
  
  get peek() {
    if (this.stash.length) {
      return this.stash[0];
    } else {
      var tok;
      this.stash.push(tok = this.next);
      return tok;
    }
  },

  get stashed() {
    return this.stash.shift();
  },
  
  get eos() {
    if (this.str.length) return;
    return this.prevIndents-- > 0
      ? new Token('outdent')
      : new Token('eos');
  },

  get newline() {
    var captures;
    if (captures = /^\n( *)/.exec(this.str)) {
      this.str = this.str.substr(captures[0].length);
      var tok
        , spaces = captures[1].length
        , indents = spaces / 2;

      // To few spaces
      if (0 != spaces % 2) {
        throw new Error('Invalid indentation, got ' + spaces + ' space(s), expected multiple of 2');
      // To many spaces
      } else if (indents > this.prevIndents + 1) {
        var expected = 2 * this.prevIndents || 2;
        throw new Error('Invalid indentation, got ' + spaces + ' space(s), expected ' + expected);
      // Outdent
      } else if (indents < this.prevIndents) {
        var n = this.prevIndents - indents;
        while (--n) this.stash.push(new Token('outdent'));
        this.prevIndents = indents;
        tok = new Token('outdent');
      // Indent
      } else {
        this.prevIndents = indents;
        tok = new Token('indent');
      }

      return tok;
    }
  },

  get color() {
    return this.hexColor;
  },
  
  get hexColor() {
    return this.hex6Color
      || this.hex3Color
      || this.rgba
      || this.rgb;
  },

  get rgb() {
    var captures;
    if (captures = /^rgb\( *(\d+) *, *(\d+) *, *(\d+) *\)/.exec(this.str)) {
      this.str = this.str.substr(captures[0].length);
      var r = parseInt(captures[1], 10)
        , g = parseInt(captures[2], 10)
        , b = parseInt(captures[3], 10);
      return new Token('color', new nodes.Color(r, g, b, 1));
    }    
  },
  
  get rgba() {
    var captures;
    if (captures = /^rgba\( *(\d+) *, *(\d+) *, *(\d+) *, *(\d+(?:\.\d+)?) *\)/.exec(this.str)) {
      this.str = this.str.substr(captures[0].length);
      var r = parseInt(captures[1], 10)
        , g = parseInt(captures[2], 10)
        , b = parseInt(captures[3], 10)
        , a = parseFloat(captures[4]);
      return new Token('color', new nodes.Color(r, g, b, a));
    }    
  },
  
  get hex3Color() {
    var captures;
    if (captures = /^#([a-f-A-F0-9]{3})/.exec(this.str)) {
      this.str = this.str.substr(4);
      var rgb = captures[1]
        , r = parseInt(rgb[0] + rgb[0], 16)
        , g = parseInt(rgb[1] + rgb[1], 16)
        , b = parseInt(rgb[2] + rgb[2], 16);
      return new Token('color', new nodes.Color(r, g, b, 1)); 
    }
  },
  
  get hex6Color() {
    var captures;
    if (captures = /^#([a-f-A-F0-9]{6})/.exec(this.str)) {
      this.str = this.str.substr(7);
      var rgb = captures[1]
        , r = parseInt(rgb.substr(0, 2), 16)
        , g = parseInt(rgb.substr(2, 2), 16)
        , b = parseInt(rgb.substr(4, 2), 16);
      return new Token('color', new nodes.Color(r, g, b, 1)); 
    }
  },
  
  get id() {
    var captures;
    if (captures = /^([^\n]+)/.exec(this.str)) {
      var id = captures[0];
      this.str = this.str.substr(id.length);
      return new Token('id', id);
    }
  }
};
