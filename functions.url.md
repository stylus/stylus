## Data URI Image Inlining

Stylus is bundled with an optional function named `url()`, which replaces the literal `url()` calls, and conditionally inlines them using base64 [Data URIs](http://en.wikipedia.org/wiki/Data_URI_scheme).

The function itself is available via `require('stylus').url`, and accepts an options object. The `.define(name, callback)` method assigned a JavaScript function that can be called from stylus source. In this case we have our images in `./images`, so we simply pass the lookup paths array with `__dirname` the directory of the executing script. This array tells stylus where to attempt looking for your image.

    stylus(str)
      .set('filename', 'images.css')
      .define('url', stylus.url({ paths: [__dirname] }))
      .render(function(err, css){
        if (err) throw err;
        console.log(css);
      });

supported options:

  - `limit` bytesize limit defaulting to 30Kb (30000)
  - `paths` image resolution path(s)