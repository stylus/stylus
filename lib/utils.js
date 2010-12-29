
/*!
 * CSS - utils
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var nodes = require('./nodes')
  , inspect = require('sys').inspect;

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
  var lineno = renderer.evaluator
      ? renderer.evaluator.lineno
      : renderer.parser.lexer.lineno
    , contextLineno = lineno - 2
    , contextLines = options.context || 6
    , lastWidth = (contextLineno + contextLines).toString().length;

  var src = renderer.str.split('\n')
    .slice(contextLineno, contextLineno + contextLines)
    .map(function(line){
      var n = ++contextLineno
        , width = n.toString().length
        , pad = Array(lastWidth - width + 1).join(' ');
      return '  ' + pad + n + ': ' + inspect(line);
    })
    .join('\n');

  err.message = renderer.filename
    + ':' + lineno
    + '\n' + src
    + '\n\n' + err.message;

  return err;
};

/**
 * Assert that `node` is of the given `type`, or throw.
 *
 * @param {Node} node
 * @param {Function} type
 * @param {String} param
 * @api public
 */

exports.assertType = function(node, type, param){
  exports.assertPresent(node, param);
  if (node instanceof type) return;
  var actual = node.constructor.name
    , msg = 'expected ' + type.name + ', but got ' + actual + ':' + node;
  throw new Error('TypeError: ' + msg);
};

/**
 * Assert that `node` is a `Color` or `HSLA`.
 *
 * @param {Node} node
 * @param {String} param
 * @api public
 */

exports.assertColor = function(node, param){
  exports.assertPresent(node, param);
  if (node instanceof nodes.Color) return;
  if (node instanceof nodes.HSLA) return;
  var actual = node.constructor.name;
  msg = msg || 'expected Color or HSLA, but got ' + actual + ':' + node;
  throw new Error('TypeError: ' + msg);
};

/**
 * Assert that param `name` is given, aka the `node` is passed.
 *
 * @param {Node} node
 * @param {String} name
 * @api public
 */

exports.assertPresent = function(node, name){
  if (node) return;
  if (name) throw new Error('ArgumentError: argument ' + name + ' required');
  throw new Error('ArgumentError: argument missing');
}