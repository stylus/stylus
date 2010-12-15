
/*!
 * CSS - Stack
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Frame = require('./frame');

/**
 * Initialize a new `Stack`.
 *
 * @api private
 */

var Stack = module.exports = function Stack() {
  Array.apply(this, arguments);
};

/**
 * Inherit from `Array.prototype`.
 */

Stack.prototype.__proto__ = Array.prototype;

/**
 * Lookup the given local variable `name`.
 *
 * @param {String} name
 * @return {Node}
 * @api public
 */

Stack.prototype.lookup = function(name){
  var val;
  for (var i = 0; i < this.length; ++i) {
    if (val = this[i].lookup(name)) {
      return val;
    }
  }
};