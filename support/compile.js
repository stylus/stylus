
/**
 * Module dependencies.
 */

var fs = require('fs');

// package.json

var info = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// read scripts

console.error();
info.scripts.forEach(function(path){
  console.error('  \033[90m- %s\033[0m', path);
  var js = fs.readFileSync(path, 'utf8');
  console.log(js);
});
console.error();
