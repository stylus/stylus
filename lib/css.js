
/*!
 * CSS
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Renderer = require('./renderer');

/**
 * Library version.
 */

exports.version = '0.0.1';

/**
 * Render the given `str` with `options` and callback `fn(err, css)`.
 *
 * @param {String} str
 * @param {Object} options
 * @param {Function} fn
 * @api public
 */

exports.render = function(str, options, fn){
  new Renderer(str, options).render(fn);
};