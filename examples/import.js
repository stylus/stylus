
/**
 * Module dependencies.
 */

var css = require('../')
  , str = require('fs').readFileSync(__dirname + '/import.css', 'utf8');

css.render(str, { filename: __dirname + '/import.css' }, function(err, css){
  if (err) throw err;
  console.log(css);
});