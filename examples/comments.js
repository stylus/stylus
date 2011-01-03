
/**
 * Module dependencies.
 */

var css = require('../')
  , str = require('fs').readFileSync(__dirname + '/comments.styl', 'utf8');

css.render(str, { filename: 'comments.styl' }, function(err, css){
  console.log(css);
});