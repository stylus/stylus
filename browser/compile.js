
/**
 * Module dependencies.
 */

 var fs = require('fs');

 // package.json
 
 var info = JSON.parse(fs.readFileSync('browser/stylus.json', 'utf8'));
 
 // BIFs
 var bifs = fs.readFileSync('lib/functions/index.styl', 'utf8');
 
 // refactored version of weepy's
 // https://github.com/weepy/brequire/blob/master/browser/brequire.js
 
 var browser = {
   
   /**
    * Require a module.
    */
   
   require: function require(p){
     var path = require.resolve(p)
       , mod = require.modules[path];
     if (!mod) throw new Error('failed to require "' + p + '"');
     if (!mod.exports) {
       mod.exports = {};
       mod.call(mod.exports, mod, mod.exports, require.relative(path));
     }
     return mod.exports;
   },
   
   /**
    * Resolve module path.
    */
 
   resolve: function(path){
     var orig = path
       , reg = path + '.js'
       , index = path + '/index.js';
     return require.modules[reg] && reg
       || require.modules[index] && index
       || orig;
   },
   
   /**
    * Return relative require().
    */
 
   relative: function(parent) {
     return function(p){
       if ('.' != p[0]) return require(p);
       
       var path = parent.split('/')
         , segs = p.split('/');
       path.pop();
       
       for (var i = 0; i < segs.length; i++) {
         var seg = segs[i];
         if ('..' == seg) path.pop();
         else if ('.' != seg) path.push(seg);
       }
 
       return require(path.join('/'));
     };
   },
   
   /**
    * Register a module.
    */
 
   register: function(path, fn){
     require.modules[path] = fn;
   }
 };
 
 // read scripts
 
 console.error();
 console.log(browser.require + '\n\n');
 console.log('var bifs = "' + bifs.replace(/"/g, "'").replace(/\n/g, '\\n\\\n') + '";');
 console.log('require.modules = {};\n\n');
 console.log('require.resolve = ' + browser.resolve + ';\n\n');
 console.log('require.register = ' + browser.register + ';\n\n');
 console.log('require.relative = ' + browser.relative + ';\n\n');
 info.scripts.forEach(function(path){
   console.error('  \033[90m- %s\033[0m', path);
   var js = fs.readFileSync(path, 'utf8');
   path = path.replace('lib/', '');
   console.log('\nrequire.register("%s", function(module, exports, require){\n', path);
   console.log(js);
   console.log('\n});// module: %s\n', path);
 });
 console.error();