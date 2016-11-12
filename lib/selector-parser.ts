/*!
 * Stylus - Selector Parser
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */
var trimRight = require('trim-right');
var COMBINATORS = ['>', '+', '~'];

/**
 * Initialize a new `SelectorParser`
 * with the given `str` and selectors `stack`.
 *
 * @param {StringNode} str
 * @param {Array} stack
 * @param {Array} parts
 * @api private
 */

export = class SelectorParser {
  pos;
  level;
  nested;
  ignore;
  raw;
  constructor(public str,
              public stack = [],
              public parts = []) {
  this.pos = 0;
  this.level = 2;
  this.nested = true;
  this.ignore = false;
}

/**
 * Consume the given `len` and move current position.
 *
 * @param {Number} len
 * @api private
 */
skip(len) {
  this.str = this.str.substr(len);
  this.pos += len;
}

/**
 * Consume spaces.
 */
skipSpaces() {
  while (' ' == this.str[0]) this.skip(1);
}

/**
 * Fetch next token.
 *
 * @return {String}
 * @api private
 */
advance() {
  return this.root()
    || this.relative()
    || this.initial()
    || this.escaped()
    || this.parent()
    || this.partial()
    || this.char();
}

/**
 * '/'
 */
root() {
  if (!this.pos && '/' == this.str[0]
    && 'deep' != this.str.slice(1, 5)) {
    this.nested = false;
    this.skip(1);
  }
}

/**
 * '../'
 */
relative(multi?) {
  if ((!this.pos || multi) && '../' == this.str.slice(0, 3)) {
    this.nested = false;
    this.skip(3);
    while (this.relative(true)) this.level++;
    if (!this.raw) {
      var ret = this.stack[this.stack.length - this.level];
      if (ret) {
        return ret;
      } else {
        this.ignore = true;
      }
    }
  }
}

/**
 * '~/'
 */
initial() {
  if (!this.pos && '~' == this.str[0] && '/' == this.str[1]) {
    this.nested = false;
    this.skip(2);
    return this.stack[0];
  }
}

/**
 * '\' ('&' | '^')
 */
escaped() {
  if ('\\' == this.str[0]) {
    var char = this.str[1];
    if ('&' == char || '^' == char) {
      this.skip(2);
      return char;
    }
  }
}

/**
 * '&'
 */
parent() {
  if ('&' == this.str[0]) {
    this.nested = false;

    if (!this.pos && (!this.stack.length || this.raw)) {
      var i = 0;
      while (' ' == this.str[++i]) ;
      if (~COMBINATORS.indexOf(this.str[i])) {
        this.skip(i + 1);
        return;
      }
    }

    this.skip(1);
    if (!this.raw)
      return this.stack[this.stack.length - 1];
  }
}

/**
 * '^[' range ']'
 */
partial() {
  if ('^' == this.str[0] && '[' == this.str[1]) {
    this.skip(2);
    this.skipSpaces();
    var ret = this.range();
    this.skipSpaces();
    if (']' != this.str[0]) return '^[';
    this.nested = false;
    this.skip(1);
    if (ret) {
      return ret;
    } else {
      this.ignore = true;
    }
  }
}

/**
 * '-'? 0-9+
 */
number() {
  var i = 0, ret = '';
  if ('-' == this.str[i])
    ret += this.str[i++];

  while (this.str.charCodeAt(i) >= 48
    && this.str.charCodeAt(i) <= 57)
    ret += this.str[i++];

  if (ret) {
    this.skip(i);
    return Number(ret);
  }
}

/**
 * number ('..' number)?
 */
range() {
  var start = this.number()
    , ret;

  if ('..' == this.str.slice(0, 2)) {
    this.skip(2);
    var end = this.number()
      , len = this.parts.length;

    if (start < 0) start = len + start - 1;
    if (end < 0) end = len + end - 1;

    if (start > end) {
      var tmp = start;
      start = end;
      end = tmp;
    }

    if (end < len - 1) {
      ret = this.parts.slice(start, end + 1).map(function (part) {
        var selector = new SelectorParser(part, this.stack, this.parts);
        selector.raw = true;
        return selector.parse();
      }, this).map(function (selector) {
        return (selector.nested ? ' ' : '') + selector.val;
      }).join('').trim();
    }
  } else {
    ret = this.stack[
      start < 0 ? this.stack.length + start - 1 : start
      ];
  }

  if (ret) {
    return ret;
  } else {
    this.ignore = true;
  }
}

/**
 * .+
 */
char() {
  var char = this.str[0];
  this.skip(1);
  return char;
}

/**
 * Parses the selector.
 *
 * @return {Object}
 * @api private
 */
parse() {
  var val = '';
  while (this.str.length) {
    val += this.advance() || '';
    if (this.ignore) {
      val = '';
      break;
    }
  }
  return {val: trimRight(val), nested: this.nested};
}
}