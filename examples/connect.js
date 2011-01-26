
/**
 * Module dependencies.
 */

var connect = require('connect')
  , stylus = require('../');

// Setup server
// $ curl http://localhost:3000/variables.css

var server = connect.createServer(
    stylus.middleware(__dirname)
  , connect.staticProvider(__dirname)
);

server.listen(3000);