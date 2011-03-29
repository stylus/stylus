
/*!
 * Stylus - Arguments
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('../nodes')
  , utils = require('../utils');

/**
 * Initialize a new `Arguments`.
 *
 * @api public
 */

var Arguments = module.exports = function Arguments(){
  nodes.Expression.call(this);
  this.map = {};
};

/**
 * Inherit from `nodes.Expression.prototype`.
 */

Arguments.prototype.__proto__ = nodes.Expression.prototype;

/**
 * Return "Arguments(<a> <b> <c>)"
 *
 * @return {String}
 * @api public
 */

Arguments.prototype.toString = function(){
  return 'Arguments(' + this.nodes.map(function(node){
    return node.toString();
  }).join(this.isList ? ', ' : ' ') + ')';
};

/**
 * Resolve keyword arguments for the given `fn`.
 *
 * @param {Function|nodes.Function} fn
 * @return {Array}
 * @api private
 */

Arguments.prototype.resolve = function(fn){
  var args = this.nodes
    , ret = []
    , self = this;

  // js function
  if (fn.fn) {
    utils.params(fn.fn).forEach(argument);
  // stylus function
  } else {
    fn.params.nodes.forEach(function(param){
      argument(param.string);
    });
  }

  // support mapped arguments
  function argument(param) {
    var val = self.map[param] || args.shift();
    if (undefined !== val) ret.push(val);
  }

  return ret.concat(args);
};

/**
 * Initialize an `Arguments` object with the nodes
 * from the given `expr`.
 *
 * @param {Expression} expr
 * @return {Arguments}
 * @api public
 */

Arguments.fromExpression = function(expr){
  var args = new Arguments
    , len = expr.nodes.length;
  args.lineno = expr.lineno;
  for (var i = 0; i < len; ++i) {
    args.push(expr.nodes[i]);
  }
  return args;
};
