
/**
 * Module dependencies.
 */

var css = require('../')
  , str = require('fs').readFileSync(__dirname + '/variables.css', 'utf8');

css.render(str, { filename: 'variables.css' }, function(err, css){
  if (err) throw err;
  console.log(css);
});