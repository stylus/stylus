
/**
 * Module dependencies.
 */

var css = require('../')
  , nodes = css.nodes
  , str = require('fs').readFileSync(__dirname + '/js-functions.styl', 'utf8')
  , fs = require('fs');

function add(a, b) {
  return a.operate('+', b);
}

function sub(a, b) {
  return a.operate('-', b);
}

function imageSize(img) {
  // assert that the node (img) is a String node, passing
  // the param name for error reporting
  css.utils.assertType(img, 'string', 'img');
  var path = img.val;

  // Grab bytes necessary to retrieve dimensions.
  // if this was real you would do this per format,
  // instead of reading the entire image :)
  var data = fs.readFileSync(__dirname + '/' + path);

  // GIF
  // of course you would support.. more :)
  if ('GIF' == data.slice(0, 3).toString()) {
    var w = data.slice(6, 8)
      , h = data.slice(8, 10);
    w = w[1] << 8 | w[0];
    h = h[1] << 8 | h[0];
  }

  // Return (w h)
  var expr = new nodes.Expression;
  expr.push(new nodes.Unit(w));
  expr.push(new nodes.Unit(h));

  return expr;
}

css(str)
  .set('filename', 'js-functions.styl')
  .define('add', add)
  .define('sub', sub)
  .define('image-size', imageSize)
  .render(function(err, css){
    if (err) throw err;
    console.log(css);
  });