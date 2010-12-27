
/**
 * Module dependencies.
 */

var css = require('../')
  , str = require('fs').readFileSync(__dirname + '/property-functions.css', 'utf8');

css.render(str, { filename: 'property-functions.css' }, function(err, css){
  if (err) throw err;
  console.log(css);
});