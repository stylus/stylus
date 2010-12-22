
/**
 * Module dependencies.
 */

var css = require('../')
  , str = require('fs').readFileSync(__dirname + '/basic.css', 'utf8');

css.render(str, { filename: 'basic.css' }, function(err, css){
  if (err) throw err;
  console.log(css);
});