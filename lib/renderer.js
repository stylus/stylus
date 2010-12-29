
/*!
 * CSS - Renderer
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Parser = require('./parser')
  , Compiler = require('./visitor/compiler')
  , Evaluator = require('./visitor/evaluator')
  , utils = require('./utils');

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
  this.options = options;
  this.str = str;
  this.filename = options.filename || 'stylus';
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
    var ast = this.parser.parse();
    this.evaluator = new Evaluator(ast, this.options);
    ast = this.evaluator.evaluate();
    new Compiler(ast, this.options).compile(fn);
  } catch (err) {
    fn(utils.formatException(
        this
      , err
      , this.options));
  }
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
 * Define function with the given `name`.
 *
 * @param {String} name
 * @param {Function} fn
 * @return {Renderer} for chaining
 * @api public
 */

Renderer.prototype.define = function(name, fn){
  this.options.functions[name] = fn;
  return this;
};

