/*!
 * Stylus - Selector Parser
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Initialize a new `SelectorParser`
 * with the given `str` and selectors `stack`.
 *
 * @param {String} str
 * @param {Array} stack
 * @api private
 */

var SelectorParser = module.exports = function SelectorParser(str, stack) {
  this.str = str;
  this.stack = stack;
  this.pos = 0;
  this.nested = true;
  this.level = 2;
};

/**
 * Consume the given `len` and move current position.
 *
 * @param {Number} len
 * @api private
 */

SelectorParser.prototype.skip = function(len) {
  this.str = this.str.substr(len);
  this.pos += len;
};

/**
 * Fetch next token.
 *
 * @return {String}
 * @api private
 */

SelectorParser.prototype.advance = function() {
  return this.root()
    || this.relative()
    || this.escaped()
    || this.parent()
    || this.partial()
    || this.char();
};

/**
 * Root reference.
 */

SelectorParser.prototype.root = function() {
  if (!this.pos && '/' == this.str[0]
    && 'deep' != this.str.slice(1, 5)) {
    this.nested = false;
    this.skip(1);
  }
};

/**
 * Relative reference.
 */

SelectorParser.prototype.relative = function(multi) {
  if ((!this.pos || multi) && '../' == this.str.slice(0, 3)) {
    this.nested = false;
    this.skip(3);
    while (this.relative(true)) this.level++;
    return this.stack[this.stack.length - this.level];
  }
};

/**
 * Escaped parent reference.
 */

SelectorParser.prototype.escaped = function() {
  if ('\\' == this.str[0] && '&' == this.str[1]) {
    this.nested = false;
    this.skip(2);
    return '&';
  }
};

/**
 * Parent reference.
 */

SelectorParser.prototype.parent = function() {
  if ('&' == this.str[0]) {
    this.nested = false;
    this.skip(1);
    return this.stack[this.stack.length - 1];
  }
};

/**
 * Partial reference.
 */

SelectorParser.prototype.partial = function() {
  if ('^' == this.str[0] && '[' == this.str[1]) {
    var i =  1, num = '';
    while (']' != this.str[++i]
      && ((this.str.charCodeAt(i) >= 48
      && this.str.charCodeAt(i) <= 57)
      || this.str[i] == '-'))
      num += this.str[i];

    if (']' != this.str[i]) return;
    if (!isNaN(num = Number(num))) {
      this.nested = false;
      this.skip(i + 1);
      return this.stack[num < 0 ? this.stack.length + num - 1 : num];
    }
  }
};

/**
 * Character of the selector.
 */

SelectorParser.prototype.char = function() {
  var char = this.str[0];
  this.skip(1);
  return char;
};

/**
 * Parses the selector.
 *
 * @return {Object}
 * @api private
 */

SelectorParser.prototype.parse = function() {
  var val = '';
  while (this.str.length) {
    val += this.advance() || '';
  }
  return { val: val.trimRight(), nested: this.nested };
};
