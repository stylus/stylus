---
layout: default
permalink: docs/js.html
---

# JavaScript API

Simply `require` the module, and call `render()` with the given string of Stylus code, and (optional) `options` object. 

Frameworks utilizing Stylus should pass the `filename` option to provide better error reporting.

```js
var stylus = require('stylus');

stylus.render(str, { filename: 'nesting.css' }, function(err, css){
  if (err) throw err;
  console.log(css);
});
```

We can also do the same thing in a more progressive manner:

```js
var stylus = require('stylus');

stylus(str)
  .set('filename', 'nesting.css')
  .render(function(err, css){
    // logic
  });
```

## .set(setting, value)

Apply a setting such as a `filename`, or import `paths`:

```js 
.set('filename', __dirname + '/test.styl')
.set('paths', [__dirname, __dirname + '/mixins'])
```
## .include(path)

A progressive alternative to `.set('paths',...)` is `.include()`.  This is ideal when exposing external Stylus libraries which expose a path.

```js
stylus(str)
  .include(require('nib').path)
  .include(process.env.HOME + '/mixins')
  .render(...)
```

## .import(path)

Defer importing of the given `path` until evaluation is performed. The example below is essentially the same as doing `@import 'mixins/vendor'` within your Stylus sheet.

```js
var stylus = require('../')
  , str = require('fs').readFileSync(__dirname + '/test.styl', 'utf8');

stylus(str)
  .set('filename', __dirname + '/test.styl')
  .import('mixins/vendor')
  .render(function(err, css){
  if (err) throw err;
  console.log(css);
});
```

## .define(name, node)

By passing a `Node`, we may define a global variable. This is useful when exposing conditional features within your library depending on the availability of another. For example the **Nib** extension library conditionally supports node-canvas, providing image generation. 
 
However, this is not always available, so Nib may define:

```js
.define('has-canvas', stylus.nodes.false);
.define('some-setting', new stylus.nodes.String('some value'));
```

Stylus also casts JavaScript values to their Stylus equivalents when possible. Here are a few examples:

```js
.define('string', 'some string')
.define('number', 15.5)
.define('some-bool', true)
.define('list', [1,2,3])
.define('list', [1,2,[3,4,[5,6]]])
.define('list', { foo: 'bar', bar: 'baz' })
.define('families', ['Helvetica Neue', 'Helvetica', 'sans-serif'])
```

These same rules apply to return values in js functions as well:

```js
.define('get-list', function(){
  return ['foo', 'bar', 'baz'];
})
```

## .define(name, fn)

This method allows you to provide a JavaScript-defined function to Stylus. Think of these as you would JavaScript-to-C++ bindings. When there's something you cannot do in Stylus, define it in JavaScript!

In this example, we define four functions: `add()`, `sub()`, `image-width()`, and `image-height()`. These functions must return a `Node`, this constructor and the other nodes are available via `stylus.nodes`.

```js
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
```
 
For further reference (until documentation is complete) please see the following files:
 
```bash
- `lib/nodes/*`
- `lib/utils.js`
```

## .use(fn)

When called, the given `fn` is invoked with the renderer, allowing all of the methods above to be used. This allows for plugins to easily expose themselves, defining functions, paths etc.

```js
var mylib = function(style){
  style.define('add', add);
  style.define('sub', sub);
};

stylus(str)
  .use(mylib)
  .render(...)
```
When calling the `render()` method with options, the `use` option can be given
a function or array of functions to be invoked with the renderer.

```stylus
stylus.render(str, { use: mylib }, function(err, css){
  if (err) throw err;
  console.log(css);
});
```

## .deps()

Returns array of dependencies (import files):

```stylus
stylus('@import "a"; @import "b"')
  .deps();

// => ['a.styl', 'b.styl']
```
See also [--deps CLI flag](http://stylus-lang.com/docs/executable.html#list-dependencies).

## stylus.resolver([options])

Optional built-in function which may be used to resolve relative urls inside imported files:

```stylus
stylus(str)
  .define('url', stylus.resolver())
  .render(function(err, css) {

  });
```

See also [--resolve-url CLI flag](http://stylus-lang.com/docs/executable.html#resolving-relative-urls-inside-imports).

Options:

```bash
- `paths` additional resolution path(s)
- `nocheck` don't check file existence
```
