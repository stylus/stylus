
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
};

/**
 * Lexer prototype.
 */

Lexer.prototype = {
  get next() {
    return this.stashed
      || this.color
      || this.property
      || this.selector;
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
  
  get property() {
    
  },
  
  get selector() {
    
  }
};
