---
layout: default
permalink: docs/middleware.html
---

# Connect Middleware

Stylus ships with [Connect](http://www.senchalabs.org/connect/) middleware for auto-compiling Stylus sheets whenever they're modified.

## stylus.middleware(options)

### Options

Return Connect middleware with the given `options`.

```bash
`serve`     Serve the stylus files from `dest` [true]
`force`     Always re-compile
`src`       Source directory used to find .styl files
`dest`      Destination directory used to output .css files
            when undefined defaults to `src`.
`compile`   Custom compile function, accepting the arguments
            `(str, path)`.
`compress`  Whether the output .css files should be compressed
`firebug`   Emits debug infos in the generated css that can
            be used by the FireStylus Firebug plugin
`linenos`   Emits comments in the generated css indicating 
            the corresponding stylus line
`sourcemap` Generates a sourcemap in sourcemaps v3 format
```

### Examples

Serve .styl files from ./public:

```js
var app = connect();

app.middleware(__dirname + '/public');
```

Change the `src` and `dest` options to alter where .styl files
are loaded and where they're saved:

```js
var app = connect();

app.middleware({
  src: __dirname + '/stylesheets',
  dest: __dirname + '/public'
});
```

Here we set up the custom compile function so that we may
set the `compress` option, or define additional functions.
 
By default the compile function simply sets the `filename`
and renders the CSS. In the following case we're compressing
the output, using the "nib" library plugin, and auto-importing it.

```js
function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .set('compress', true)
    .use(nib())
    .import('nib');
}
```

Pass it as an option like so:

```js
var app = connect();

app.middleware({
    src: __dirname
  , dest: __dirname + '/public'
  , compile: compile
})
```
