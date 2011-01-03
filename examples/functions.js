
/**
 * Module dependencies.
 */

var css = require('../')
  , str = require('fs').readFileSync(__dirname + '/functions.styl', 'utf8');

css.render(str, { filename: 'functions.styl' }, function(err, css){
  if (err) throw err;
  console.log(css);
});