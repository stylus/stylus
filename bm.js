
/**
 * Module dependencies.
 */

var stylus = require('./');

var times = 200
  , n = times
  , start = new Date;

console.log('compiling %d times', times);

while (n--) {
  stylus('body\n  color: white;\n  background: url(/images/foo.png)\n  a\n    &:hover\n      text-decoration: underline;')
    .render(function(err, css){});
}

var duration = new Date - start;
console.log('  duration: %dms', duration);
console.log('  average: %dms', duration / times);
console.log('  per second: %d', (times / (duration / 1000)).toFixed(1));
