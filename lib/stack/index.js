
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
 * Lookup stack frame for the given `block`.
 *
 * @param {Block} block
 * @return {Frame}
 * @api private
 */

Stack.prototype.getBlockFrame = function(block){
  for (var i = 0; i < this.length; ++i) {
    if (block == this[i].block) {
      return this[i];
    }
  }
};

/**
 * Lookup the given local variable `name`, relative
 * to the lexical scope of the current frame's `Block`.
 *
 * When the result of a lookup is an identifier or a variable
 * a recursive lookup is performed.
 *
 * @param {String} name
 * @return {Node}
 * @api private
 */

Stack.prototype.lookup = function(name){
  var val
    , i = this.length
    , block = this.currentFrame.block;
  do {
    var frame = this.getBlockFrame(block);
    if (val = frame.lookup(name)) {
      switch (val.first.nodeName) {
        case 'ident':
          return this.lookup(val.first.val);
        case 'variable':
          return this.lookup(val.first.name);
        default:
          return val;
      }
    }
  } while (block = block.parent);
};