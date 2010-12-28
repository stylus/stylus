
/**
 * Module dependencies.
 */

var css = require('../')
  , str = require('fs').readFileSync(__dirname + '/conversions.css', 'utf8');

css.render(str, { filename: 'conversions.css' }, function(err, css){
  if (err) throw err;
  console.log(css);
});