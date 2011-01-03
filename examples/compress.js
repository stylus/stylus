
/**
 * Module dependencies.
 */

var css = require('../')
  , str = require('fs').readFileSync(__dirname + '/basic.styl', 'utf8');

css.render(str, { filename: 'basic.styl', compress: true }, function(err, css){
  if (err) throw err;
  console.log(css);
});