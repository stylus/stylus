
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
 * Check if `other` block is within the lexical scope of `block`.
 *
 * @param {Block} block
 * @param {Block} other
 * @return {Boolean}
 * @api private
 */

Stack.prototype.withinLexicalScope = function(block, other){
  do {
    if (block == other) return true;
  } while (block = block.parent);
};

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
  var val
    , i = this.length;
  // TODO: reverse
  console.log('@' + name);
  while (i--) {
    if (this.withinLexicalScope(block, this[i].block)) {
      console.log(this[i]);
      if (val = this[i].lookup(name)) {
        return val;
      }
    }
  }
};