
/*!
 * CSS - Renderer
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Parser = require('./parser')
  , PrettyPrinter = require('./visitor/prettyprinter')
  , Compiler = require('./visitor/compiler');

/**
 * Initialize a new `Renderer` with the given `str` and `options`.
 *
 * @param {String} str
 * @param {Object} options
 * @api public
 */

var Renderer = module.exports = function Renderer(str, options) {
  options = options || {};
  this.options = options;
  this.str = str;
  this.filename = options.filename || 'css';
  this.parser = new Parser(str, options);
};

/**
 * Parse and evaluate AST, then callback `fn(err, css)`.
 *
 * @param {Function} fn
 * @api public
 */

Renderer.prototype.render = function(fn){
  var ast = this.parser.parse().eval();

  var pp = new PrettyPrinter(ast);
  pp.output();

  var compiler = new Compiler(ast, this.options);
  compiler.compile(fn);
};
