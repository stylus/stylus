
/*!
 * Stylus - Renderer
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Parser = require('./parser')
  , Compiler = require('./visitor/compiler')
  , Evaluator = require('./visitor/evaluator')
  , utils = require('./utils')
  , nodes = require('./nodes');

/**
 * Initialize a new `Renderer` with the given `str` and `options`.
 *
 * @param {String} str
 * @param {Object} options
 * @api public
 */

var Renderer = module.exports = function Renderer(str, options) {
  options = options || {};
  options.functions = {};
  options.imports = [__dirname + '/functions'];
  options.filename = options.filename || 'stylus';
  this.str = str;
  this.options = options;
  this.parser = new Parser(str, options);
};

/**
 * Parse and evaluate AST, then callback `fn(err, css)`.
 *
 * @param {Function} fn
 * @api public
 */

Renderer.prototype.render = function(fn){
  try {
    var ast = this.parser.parse()
      , expr;
    this.evaluator = new Evaluator(ast, this.options);
    ast = this.evaluator.evaluate();
    new Compiler(ast, this.options).compile(fn);
  } catch (err) {
    fn(utils.formatException(
        this
      , err
      , this.options));
  }
  nodes.source = null;
};

/**
 * Set option `key` to `val`.
 *
 * @param {String} key
 * @param {Mixed} val
 * @return {Renderer} for chaining
 * @api public
 */

Renderer.prototype.set = function(key, val){
  this.options[key] = val;
  return this;
};

/**
 * Define function with the given `name`. Optionally
 * the function may accept full expressions, by setting `raw`
 * to `true`.
 *
 * @param {String} name
 * @param {Function} fn
 * @return {Renderer} for chaining
 * @api public
 */

Renderer.prototype.define = function(name, fn, raw){
  this.options.functions[name] = fn;
  if (undefined != raw) fn.raw = raw;
  return this;
};

/**
 * Import the given `file`.
 *
 * @param {String} file
 * @return {Renderer} for chaining
 * @api public
 */

Renderer.prototype.import = function(file){
  this.options.imports.push(file);
  return this;
};


