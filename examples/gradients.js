
/**
 * Module dependencies.
 */

var css = require('../')
  , path = __dirname + '/gradients.styl'
  , str = require('fs').readFileSync(path, 'utf8');

css.render(str, { filename: path }, function(err, css){
  if (err) throw err;
  console.log(css);
});