
/**
 * Module dependencies.
 */

var css = require('../')
  , str = require('fs').readFileSync(__dirname + '/arithmetic.styl', 'utf8');

css.render(str, { filename: 'arithmetic.styl' }, function(err, css){
  if (err) throw err;
  console.log(css);
});