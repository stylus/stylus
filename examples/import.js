
/**
 * Module dependencies.
 */

var css = require('../')
  , str = require('fs').readFileSync(__dirname + '/import.styl', 'utf8');

css.render(str, { filename: __dirname + '/import.styl' }, function(err, css){
  if (err) throw err;
  console.log(css);
});