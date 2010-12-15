
/**
 * Module dependencies.
 */

var css = require('../')
  , str = require('fs').readFileSync(__dirname + '/nesting.css', 'utf8');

css.render(str, { filename: 'nesting.css' }, function(err, css){
  console.log(css);
});