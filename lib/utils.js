
/*!
 * CSS - utils
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var inspect = require('sys').inspect;

/**
 * Format the given `err` in context to `renderer`.
 *
 * @param {Renderer} renderer
 * @param {Error} err
 * @param {Object} options
 * @return {Error}
 * @api public
 */

exports.formatException = function(renderer, err, options){
  var lineno = renderer.parser.lexer.lineno
    , contextLineno = lineno - 2
    , contextLines = options.context || 6;

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