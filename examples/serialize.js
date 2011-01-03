
/**
 * Module dependencies.
 */

var css = require('../')
  , sys = require('sys')
  , str = require('fs').readFileSync(__dirname + '/basic.styl', 'utf8');

var tree = css.parse(str, { filename: 'basic.styl' });

console.log(sys.inspect(tree.toObject(), false, 6, true));