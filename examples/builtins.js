
/**
 * Module dependencies.
 */

var css = require('../')
  , str = require('fs').readFileSync(__dirname + '/builtins.css', 'utf8');

css.render(str, { filename: 'builtins.css' }, function(err, css){
  if (err) throw err;
  console.log(css);
});