
/*!
 * Stylus - Renderer
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import Parser = require('./parser');
import {EventEmitter} from 'events';
import {Evaluator} from './visitor/evaluator';
import Normalizer = require('./visitor/normalizer');
import utils = require('./utils');
import nodes = require('./nodes');
import {join} from 'path';
import {Compiler} from './visitor/compiler';
import {SourceMapper} from './visitor/sourcemapper';
import {DepsResolver} from './visitor/deps-resolver';

export var events = new EventEmitter;

/**
 * Initialize a new `Renderer` with the given `str` and `options`.
 *
 * @param {StringNode} str
 * @param {ObjectNode} options
 * @api public
 */

export interface RendererOptions {
  globals?: any;
  functions?: any;
  use?: any;
  imports?: any;
  paths?: any;
  filename?: any;
  Evaluator?: any;
  sourcemap?: any;
}

export class Renderer extends EventEmitter {
  events: EventEmitter = events;
  private parser;
  private evaluator;
  private nodes;
  private sourcemap;
  constructor(public str, private options: RendererOptions = <any>{}) {
    super();
  options.globals = options.globals || {};
  options.functions = options.functions || {};
  options.use = options.use || [];
  options.use = Array.isArray(options.use) ? options.use : [options.use];
  options.imports = [join(__dirname, 'functions')];
  options.paths = options.paths || [];
  options.filename = options.filename || 'stylus';
  options.Evaluator = options.Evaluator || Evaluator;
}

  /**
 * Parse and evaluate AST, then callback `fn(err, css, js)`.
 *
 * @param {Function} [fn]
 * @api public
 */

render(fn: (err, css?, js?) => any) {
  var parser = this.parser = new Parser(this.str, this.options);

  // use plugin(s)
  for (var i = 0, len = this.options.use.length; i < len; i++) {
    this.use(this.options.use[i]);
  }

  try {
    nodes.filename = this.options.filename;
    // parse
    var ast = parser.parse();

    // evaluate
    this.evaluator = new this.options.Evaluator(ast, this.options);
    this.nodes = nodes;
    this.evaluator.renderer = this;
    ast = this.evaluator.evaluate();

    // normalize
    var normalizer = new Normalizer(ast, this.options);
    ast = normalizer.normalize();

    // compile
    var compiler = this.options.sourcemap
      ? new SourceMapper(ast, this.options)
      : new Compiler(ast, this.options)
      , css = compiler.compile();

    // expose sourcemap
    if (this.options.sourcemap) this.sourcemap = (<SourceMapper>compiler).map.toJSON();
  } catch (err) {
    var options: any = {};
    options.input = err.input || this.str;
    options.filename = err.filename || this.options.filename;
    options.lineno = err.lineno || parser.lexer.lineno;
    options.column = err.column || parser.lexer.column;
    if (!fn) throw utils.formatException(err, options);
    return fn(utils.formatException(err, options));
  }

  // fire `end` event
  var listeners = this.listeners('end');
  if (fn) listeners.push(fn);
  for (let i = 0, len = listeners.length; i < len; i++) {
    var ret = listeners[i](null, css);
    if (ret) css = ret;
  }
  if (!fn) return css;
}

/**
 * Get dependencies of the compiled file.
 *
 * @param {String} [filename]
 * @return {Array}
 * @api public
 */

deps(filename: string) {
  var opts = utils.merge({cache: false}, this.options);
  if (filename) opts.filename = filename;

  var parser = new Parser(this.str, opts);

  try {
    nodes.filename = opts.filename;
    // parse
    var ast = parser.parse()
      , resolver = new DepsResolver(ast, opts);

    // resolve dependencies
    return resolver.resolve();
  } catch (err) {
    var options: any = {};
    options.input = err.input || this.str;
    options.filename = err.filename || opts.filename;
    options.lineno = err.lineno || parser.lexer.lineno;
    options.column = err.column || parser.lexer.column;
    throw utils.formatException(err, options);
  }
}

/**
 * Set option `key` to `val`.
 */
set(key: string, val): Renderer {
  this.options[key] = val;
  return this;
}

/**
 * Get option `key`.
 */
get(key: string) {
  return this.options[key];
}

/**
 * Include the given `path` to the lookup paths array.
 */
include(path: string): Renderer {
  this.options.paths.push(path);
  return this;
}

/**
 * Use the given `fn`.
 *
 * This allows for plugins to alter the renderer in
 * any way they wish, exposing paths etc.
 */

use(fn: Function): Renderer {
  fn.call(this, this);
  return this;
}

/**
 * Define function or global var with the given `name`. Optionally
 * the function may accept full expressions, by setting `raw`
 * to `true`.
 *
 * @param {String} name
 * @param {Function|Node} fn
 * @return {Renderer} for chaining
 * @api public
 */

define(name: string, fn, raw): Renderer {
  fn = utils.coerce(fn, raw);

  if (fn.nodeName) {
    this.options.globals[name] = fn;
    return this;
  }

  // function
  this.options.functions[name] = fn;
  if (undefined != raw) fn.raw = raw;
  return this;
}

/**
 * Import the given `file`.
 */

import_(file: string): Renderer {
  this.options.imports.push(file);
  return this;
}
}

