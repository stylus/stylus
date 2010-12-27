
/**
 * Module dependencies.
 */

var css = require('../')
  , sys = require('sys');

var tree = css.parse('@color = #fc0\n\nbody\n  color @color');

console.log('Pre-evaluation:\n');
console.log(sys.inspect(tree.toObject(), false, 6, true));

console.log('\nPost-evaluation:\n');
console.log(sys.inspect(tree.eval().toObject(), false, 7, true));

console.log('\nJSON:\n');
console.log(tree.eval().toJSON());
