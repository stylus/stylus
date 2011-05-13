## JavaScript API

Simply require the module, and call `render()` with the given string of stylus code, and (optional) options object. Frameworks utilizing stylus should pass the `filename` option to provide better error reporting.

    var stylus = require('stylus');

    stylus.render(str, { filename: 'nesting.css' }, function(err, css){
      if (err) throw err;
      console.log(css);
    });

We can also do the same thing in a more progressive manner:

    var stylus = require('stylus');

    stylus(str)
      .set('filename', 'nesting.css')
      .render(function(err, css){
        // logic
      });

### .set(setting, value)

 Apply a setting such as a `filename`, or import `paths`:
 
     .set('filename', __dirname + '/test.styl')
     .set('paths', [__dirname, __dirname + '/mixins'])

### .include(path)

  A progressive alternative to setting `paths` via `.set()`, which is ideal when exposing external stylus libraries which expose a path.
  
    stylus(str)
      .include(require('nib').path)
      .include(process.env.HOME + '/mixins')
      .render(...)

### .import(path)

Defer importing of the given `path` until evaluation is performed. The example below is essentially the same as doing `@import 'mixins/vendor'` within your Stylus sheet.

      var stylus = require('../')
        , str = require('fs').readFileSync(__dirname + '/test.styl', 'utf8');

      stylus(str)
        .set('filename', __dirname + '/test.styl')
        .import('mixins/vendor')
        .render(function(err, css){
        if (err) throw err;
        console.log(css);
      });

### .define(name, node)

 By passing a `Node`, we may define a global variable. This is useful when exposing conditional features within your library depending on the availability of another. For example the "Nib" extensions library conditionally supports node-canvas, providing image generation, however this is not always available, so Nib may define:
 
     .define('has-canvas', stylus.nodes.false);

### .define(name, fn)

 This method allows you to provide a JavaScript-defined function to Stylus, think of these as you would JavaScript to C++ bindings. When you have something you cannot do within Stylus, you define it in JavaScript.

In our example we define four functions `add()`, `sub()`, `image-width()`, and `image-height()`. These functions must return a `Node`, this constructor and the other nodes are available via `stylus.nodes`.

      var stylus = require('../')
        , nodes = stylus.nodes
        , utils = stylus.utils
        , fs = require('fs');

      function add(a, b) {
        return a.operate('+', b);
      }

      function sub(a, b) {
        return a.operate('-', b);
      }

      function imageDimensions(img) {
        // assert that the node (img) is a String node, passing
        // the param name for error reporting
        utils.assertType(img, 'string', 'img');
        var path = img.val;

        // Grab bytes necessary to retrieve dimensions.
        // if this was real you would do this per format,
        // instead of reading the entire image :)
        var data = fs.readFileSync(__dirname + '/' + path);

        // GIF
        // of course you would support.. more :)
        if ('GIF' == data.slice(0, 3).toString()) {
          var w = data.slice(6, 8)
            , h = data.slice(8, 10);
          w = w[1] << 8 | w[0];
          h = h[1] << 8 | h[0];
        }

        return [w, h];
      }

      function imageWidth(img) {
        return new nodes.Unit(imageDimensions(img)[0]);
      }

      function imageHeight(img) {
        return new nodes.Unit(imageDimensions(img)[1]);
      }

      stylus(str)
        .set('filename', 'js-functions.styl')
        .define('add', add)
        .define('sub', sub)
        .define('image-width', imageWidth)
        .define('image-height', imageHeight)
        .render(function(err, css){
          if (err) throw err;
          console.log(css);
        });

 For further reference until documentation is complete please reference the following files:
 
   - lib/nodes/*
   - lib/utils.js

### .use(fn)

  When called, the given `fn` is invoked with the renderer, allowing all of the methods above to be used. This allows for plugins to easily expose themselves, defining functions, paths etc.

    var mylib = function(style){
      style.define('add', add);
      style.define('sub', sub);
    };

    stylus(str)
      .use(mylib)
      .render(...)
