
/**
 * Module dependencies.
 */

var css = require('../')
  , str = require('fs').readFileSync(__dirname + '/comments.css', 'utf8');

css.render(str, { filename: 'comments.css' }, function(err, css){
  console.log(css);
});