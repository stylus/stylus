
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
  var renderer = new Renderer(str, options);
  try {
    renderer.render(fn);
  } catch (err) {
    throw exports.formatException(renderer, err);
  }
};

exports.formatException = function(renderer, err){
  var lineno = 6;
  var context = 3;
  var src = renderer.str.split('\n').slice(lineno, lineno + context).join('\n');
  err.message = renderer.filename
    + ':' + lineno
    + '\n' + src
    + '\n\n' + err.message;
  return err;
};