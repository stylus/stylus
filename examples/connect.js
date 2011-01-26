
/**
 * Module dependencies.
 */

var connect = require('connect')
  , stylus = require('../');

// Setup server
// $ curl http://localhost:3000/variables.css

function compile(str, path, fn) {
  stylus(str)
    .set('filename', path)
    .set('compress', true)
    .render(fn);
}

var server = connect.createServer(
    stylus.middleware({ src: __dirname, compile: compile })
  , connect.staticProvider(__dirname)
);

server.listen(3000);