
/**
 * Module dependencies.
 */

var stylus = require('./')
  , fs = require('fs');

var times = ~~process.env.TIMES || 1;

// test cases

var cases = fs.readdirSync('test/cases').filter(function(file){
  return ~file.indexOf('.styl');
}).map(function(file){
  return file.replace('.styl', '');
});

function lines(str) {
  return str.split('\n').length;
}

console.log();
cases.forEach(function(test){
  // ignore ones that break 
  // when we fatten them up
  if ('eol-escape' == test) return;

  var name = test.replace(/[-.]/g, ' ');
  var path = 'test/cases/' + test + '.styl';
  var styl = fs.readFileSync(path, 'utf8').replace(/\r/g, '');
  while (lines(styl) < 1000) styl += styl;

  var style = stylus(styl)
    .set('filename', path)
    .include(__dirname + '/test/images')
    .include(__dirname + '/test/cases/import.basic')
    .define('url', stylus.url());

  if (~test.indexOf('compress')) style.set('compress', true);

  var runs = []
    , n = times
    , start;

  while (n--) {
    start = new Date;
    style.render(function(err){
      if (err) throw err;
    });
    runs.push(new Date - start);
  }

  var avg = runs.reduce(function(sum, n){
    return sum + n;
  }) / times;

  console.log('  \033[36m%s \033[90m%dms\033[0m', name, avg | 0);
});
console.log();