
/**
 * Module dependencies.
 */

var css = require('../')
  , str = require('fs').readFileSync(__dirname + '/variables.styl', 'utf8');

css.render(str, { filename: 'variables.styl' }, function(err, css){
  if (err) throw err;
  console.log(css);
});