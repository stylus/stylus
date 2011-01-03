
/**
 * Module dependencies.
 */

var css = require('../')
  , str = require('fs').readFileSync(__dirname + '/conversions.styl', 'utf8');

css.render(str, { filename: 'conversions.styl' }, function(err, css){
  if (err) throw err;
  console.log(css);
});