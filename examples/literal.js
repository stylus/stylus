
/**
 * Module dependencies.
 */

var css = require('../')
  , str = require('fs').readFileSync(__dirname + '/literal.styl', 'utf8');

css.render(str, { filename: 'literal.styl' }, function(err, css){
  if (err) throw err;
  console.log(css);
});