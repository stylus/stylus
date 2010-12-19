
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
 * Return the current stack `Frame`.
 *
 * @return {Frame}
 * @api private
 */

Stack.prototype.__defineGetter__('currentFrame', function(){
  return this[this.length - 1];
});

/**
 * Lookup the given local variable `name`,
 * relative to the lexical scope of the given `block`.
 *
 * @param {Block} block
 * @param {String} name
 * @return {Node}
 * @api private
 */

Stack.prototype.lookup = function(block, name){
  var val;
  for (var i = 0; i < this.length; ++i) {
    if (val = this[i].lookup(name)) {
      return val;
    }
  }
};