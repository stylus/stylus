
/**
 * Module dependencies.
 */

var css = require('../')
  , str = require('fs').readFileSync(__dirname + '/builtins.styl', 'utf8');

css.render(str, { filename: 'builtins.styl' }, function(err, css){
  if (err) throw err;
  console.log(css);
});