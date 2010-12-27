
/**
 * Module dependencies.
 */

var css = require('../')
  , str = require('fs').readFileSync(__dirname + '/images.css', 'utf8');

css.render(str, { filename: 'images.css' }, function(err, css){
  if (err) throw err;
  console.log(css);
});