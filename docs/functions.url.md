---
layout: default
permalink: docs/functions.url.html
---

# url()

## Data URI Image Inlining

Stylus is bundled with an optional function named `url()`, which replaces the literal `url()` calls (and conditionally inlines them using base64 [Data URIs](http://en.wikipedia.org/wiki/Data_URI_scheme)).

## Example

The function itself is available via `require('stylus').url`. It accepts an `options` object, returning a function that Stylus calls internally when it sees `url()`.

The `.define(name, callback)` method assigned a JavaScript function that can be called from Stylus source. In this case, since our images are in `./css/images`,  we can ignore the `paths` option (by default image lookups are performed relative to the file being rendered).  But if desired, this behavior can be altered:

    stylus(str)
      .set('filename', __dirname + '/css/test.styl')
      .define('url', stylus.url())
      .render(function(err, css){
        // render it
      });

For example, imagine our images live in `./public/images`. We want to use `url(images/tobi.png)`.  We could pass `paths` our public directory, so that it becomes part of the lookup process. 

Likewise, if instead we wanted `url(tobi.png)`, we could pass `paths: [__dirname + '/public/images']`.

    stylus(str)
      .set('filename', __dirname + '/css/test.styl')
      .define('url', stylus.url({ paths: [__dirname + '/public'] }))
      .render(function(err, css){
        // render it
      });

### `utf8` encoding for SVGs

Since base64 encoding an image actually increases the original size, you have the option to use `utf8` encoding when inlining SVGs.

There is a bif for this: `embedurl`:

    .embed-with-utf8 {
      background-image: embedurl("circle.svg", "utf8");
    }

Would result in utf-encoded inline SVG instead of base64 one.

If you'd like to use the JS define so you could use the `paths` alongside the utf encoding, you'll need to define it using another name, not `url()`. This is Due to how `url()` function is parsed in Stylus: it is impossible now to pass the extra param to it, so you couldn't just call `url` with the second param to set the encoding. But if you'd define the `url` with another name:

    stylus(str)
      .set('filename', __dirname + '/css/test.styl')
      .define('inline-url', stylus.url({ paths: [__dirname + '/public'] }))
      .render(function(err, css){
        // render it
      });

You could then use `inline-url` bif just like you can use `embedurl`, but with an added `paths` functionality:

    .embed-with-utf8-at-path {
      background-image: inline-url("tobi.svg", "utf8");
    }

## Options

- `limit` bytesize limit defaulting to 30Kb (30000), use `false` to disable the limit
- `paths` image resolution path(s)
