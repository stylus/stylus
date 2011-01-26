
/**
 * Module dependencies.
 */

var connect = require('connect')
  , stylus = require('../');

// Setup server
// $ curl http://localhost:3000/variables.css

var server = connect.createServer(
  stylus.middleware()
);

server.listen(3000);