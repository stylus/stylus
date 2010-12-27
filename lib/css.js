
/*!
 * CSS
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Renderer = require('./renderer')
  , utils = require('./utils');

/**
 * Export render as the module.
 */

exports = module.exports = render;

/**
 * Library version.
 */

exports.version = '0.0.1';

/**
 * Parse the given `str` with `options` and return the AST.
 *
 * Examples:
 *
 *     css.parse(str);
 *     // raw ast comprised of nodes
 *
 *     css.parse(str).toObject();
 *     // plain object representation
 *     
 *     css.parse(str).toJSON();
 *     // JSON representation
 *
 * @param {String} str
 * @param {Object} options
 * @return {Object}
 * @api public
 */

exports.parse = function(str, options){
  var renderer = new Renderer(str, options);
  try {
    return renderer.parser.parse();
  } catch (err) {
    throw utils.formatException(
        renderer
      , err
      , options);
  }
};

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
  new Renderer(str, options).render(fn);
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
  return new Renderer(str, options);
}
