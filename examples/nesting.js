
/**
 * Module dependencies.
 */

var css = require('../')
  , str = require('fs').readFileSync(__dirname + '/nesting.styl', 'utf8');

css.render(str, { filename: 'nesting.styl' }, function(err, css){
  if (err) throw err;
  console.log(css);
});