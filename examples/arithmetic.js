
/**
 * Module dependencies.
 */

var css = require('../')
  , str = require('fs').readFileSync(__dirname + '/arithmetic.css', 'utf8');

css.render(str, { filename: 'arithmetic.css' }, function(err, css){
  console.log(css);
});