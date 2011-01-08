
/**
 * Module dependencies.
 */

var css = require('../')
  , str = require('fs').readFileSync(__dirname + '/implicit-functions.styl', 'utf8');

css.render(str, { filename: 'implicit-functions.styl' }, function(err, css){
  if (err) throw err;
  console.log(css);
});