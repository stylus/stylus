
/*!
 * CSS - Renderer
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Parser = require('./parser')
  , PrettyPrinter = require('./visitor/prettyprinter');

/**
 * Initialize a new `Renderer` with the given `str` and `options`.
 *
 * @param {String} str
 * @param {Object} options
 * @api public
 */

var Renderer = module.exports = function Renderer(str, options) {
  options = options || {};
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
  // TODO: cache / async toString()
  var ast = this.parser.parse().eval();
  console.log('--- input\n\n%s', this.str);
  console.log('--- output\n');
  var pp = new PrettyPrinter(ast);
  pp.output();
};
