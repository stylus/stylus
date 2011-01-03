
/**
 * Module dependencies.
 */

var css = require('../')
  , str = require('fs').readFileSync(__dirname + '/literal.css', 'utf8');

css.render(str, { filename: 'literal.css' }, function(err, css){
  if (err) throw err;
  console.log(css);
});