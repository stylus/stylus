## Import

 Stylus supports both literal __@import__ for CSS, as well as dynamic importing of other Stylus sheets.

### Literal CSS

  Any filename with the extension `.css` will become a literal. For example:
  
     @import "reset.css"

Render the literal CSS __@import__ shown below:

     @import "reset.css"

### Stylus Import

 When using __@import__ without the `.css` extension, it's assumed to be a Stylus sheet (e.g., `@import "mixins/border-radius"`).

 __@import__ works by iterating an array of directories, and checking if this file lives in any of them (similar to node's `require.paths`). This array defaults to a single path, which is derived from the `filename` option's `dirname`. So, if your filename is `/tmp/testing/stylus/main.styl`, then import will look in `/tmp/testing/stylus/`.
 
 __@import__ also supports index styles. This means when you `@import blueprint`, it will resolve **either** `blueprint.styl` **or** `blueprint/index.styl`.  This is really useful for libraries that want to expose all their features, while still allowing feature subsets to be imported. 
 
 For example, a common lib structure might be:

    ./tablet
      |-- index.styl 
      |-- vendor.styl 
      |-- buttons.styl 
      |-- images.styl 

 In the example below, we set the `paths` options to provide additional paths to Stylus. Within `./test.styl`, we could then `@import "mixins/border-radius"`, or `@import "border-radius"` (since `./mixins` is exposed to Stylus).

      /**
       * Module dependencies.
       */

      var stylus = require('../')
        , str = require('fs').readFileSync(__dirname + '/test.styl', 'utf8');

      var paths = [
          __dirname
        , __dirname + '/mixins'
      ];

      stylus(str)
        .set('filename', __dirname + '/test.styl')
        .set('paths', paths)
        .render(function(err, css){
          if (err) throw err;
          console.log(css);
        });

### JavaScript Import API

 When using the `.import(path)` method, these imports are deferred until evaluation:
 
       var stylus = require('../')
         , str = require('fs').readFileSync(__dirname + '/test.styl', 'utf8');

       stylus(str)
         .set('filename', __dirname + '/test.styl')
         .import('mixins/vendor')
         .render(function(err, css){
         if (err) throw err;
         console.log(css);
       });

 The following statement...
 
     @import 'mixins/vendor'

...is equivalent to...

     .import('mixins/vendor') 
 