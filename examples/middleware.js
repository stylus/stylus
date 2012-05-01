
/**
 * Module dependencies.
 */

var connect = require('connect')
  , stylus = require('../');

// Setup server
// $ curl http://localhost:3000/functions.css

var app = connect();

app.use(stylus.middleware({
  src: __dirname + '/mixins',
  dest: '/tmp',
  compress: true
}));

app.listen(3000);
console.log('server listening on port 3000');