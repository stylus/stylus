
/**
 * Module dependencies.
 */

var css = require('../')
  , str = require('fs').readFileSync(__dirname + '/property-functions.styl', 'utf8');

css.render(str, { filename: 'property-functions.styl' }, function(err, css){
  if (err) throw err;
  console.log(css);
});