/*!
 * Stylus
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Renderer = require('./renderer')
  , nodes = require('./nodes')
  , utils = require('./utils');

/**
 * Export render as the module.
 */

exports = module.exports = render;

/**
 * Library version.
 */

exports.version = '0.54.4';

/**
 * Expose nodes.
 */

exports.nodes = nodes;

/**
 * Expose BIFs.
 */

exports.functions = require('./functions');

/**
 * Expose utils.
 */

exports.utils = require('./utils');

/**
 * Expose constructors.
 */

exports.Visitor = require('./visitor');
exports.Parser = require('./parser');
exports.Evaluator = require('./visitor/evaluator');
exports.Normalizer = require('./visitor/normalizer');
exports.Compiler = require('./visitor/compiler');

/**
 * Render the given `str` with `options` and callback `fn(err, css)`.
 *
 * @param {String} str
 * @param {Object|Function} options
 * @param {Function} fn
 * @api public
 */

exports.render = function(str, options, fn){
  if ('function' == typeof options) fn = options, options = {};
  if (bifs) str = bifs + str;
  return new Renderer(str, options).render(fn);
};

/**
 * Return a new `Renderer` for the given `str` and `options`.
 *
 * @param {String} str
 * @param {Object} options
 * @return {Renderer}
 * @api public
 */

function render(str, options) {
  if (bifs) str = bifs + str;
  return new Renderer(str, options);
}

/**
 * Expose optional functions.
 */

exports.url = require('./functions/url');
