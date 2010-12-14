
/*!
 * CSS
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Renderer = require('./renderer')
  , inspect = require('sys').inspect;

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

/**
 * Format the given `err` in context to `renderer`.
 *
 * @param {Renderer} renderer
 * @param {Error} err
 * @return {Error}
 * @api public
 */

exports.formatException = function(renderer, err){
  var lineno = 6
    , contextLineno = lineno - 2
    , contextLines = 6;

  var src = renderer.str.split('\n')
    .slice(contextLineno, contextLineno + contextLines)
    .map(function(line){ return '  ' + ++contextLineno + ': ' + inspect(line); })
    .join('\n');

  err.message = renderer.filename
    + ':' + lineno
    + '\n' + src
    + '\n\n' + err.message;

  return err;
};