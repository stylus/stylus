/*!
 * Stylus
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import {Renderer, RendererOptions} from './renderer';

/**
 * Export render as the module.
 */

exports = module.exports = stylus;

/**
 * Library version.
 */

export var version = require('../package').version;

/**
 * Expose nodes.
 */

export var nodes = require('./nodes');

/**
 * Expose BIFs.
 */

export var functions = require('./functions');

/**
 * Expose utils.
 */

export var utils = require('./utils');

/**
 * Expose middleware.
 */

export var middleware = require('./middleware');

/**
 * Expose constructors.
 */

export var Visitor = require('./visitor');
export var Parser = require('./parser');
export var Evaluator = require('./visitor/evaluator');
export var Normalizer = require('./visitor/normalizer');
export var Compiler = require('./visitor/compiler');

/**
 * Convert the given `css` to `stylus` source.
 *
 * @param {StringNode} css
 * @return {StringNode}
 * @api public
 */

export {css as convertCSS} from './convert/css';

/**
 * Render the given `str` with `options` and callback `fn(err, css)`.
 *
 * @param {StringNode} str
 * @param {ObjectNode|Function} options
 * @param {Function} fn
 * @api public
 */

export function render(str, options: RendererOptions, fn){
  if ('function' == typeof options) fn = options, options = {};
  return new Renderer(str, options).render(fn);
}

/**
 * Return a new `Renderer` for the given `str` and `options`.
 *
 * @param {String} str
 * @param {Object} options
 * @return {Renderer}
 * @api public
 */

function stylus(str, options: RendererOptions) {
  return new Renderer(str, options);
}

/**
 * Expose optional functions.
 */

export {url} from './functions/url';
export var resolver = require('./functions/resolver');
