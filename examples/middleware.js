
/**
 * Module dependencies.
 */

var connect = require('connect')
  , stylus = require('../');

// Setup server
// $ curl http://localhost:3000/functions.css

var server = connect.createServer(
  stylus.middleware({
      src: __dirname
    , dest: __dirname + '/public'
    , compress: true
    , debug: true
  }),
  connect.static(__dirname + '/public')
);

server.listen(3000);
console.log('server listening on port 3000');