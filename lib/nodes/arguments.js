
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
    , ret = [];

  // js function
  if (fn.fn) {
    console.log(fn);
    console.log(utils.params(fn.fn));
  // stylus function
  } else {
    fn.params.nodes.forEach(function(param){
      var name = param.string
        , val = this.map[name];
      ret.push(val
        ? val
        : args.shift()); 
    }, this);
  }

  return ret;
};
