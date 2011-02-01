## Data URI Image Inlining

Stylus is bundled with an optional function named `url()`, which replaces the literal `url()` calls, and conditionally inlines them using base64 [Data URIs](http://en.wikipedia.org/wiki/Data_URI_scheme).

### Example

The function itself is available via `require('stylus').url`, and accepts an options object, returning a function that Stylus calls internally when it sees `url()`.

The `.define(name, callback)` method assigned a JavaScript function that can be called from stylus source. In this case we have our images in `./css/images` then we can ignore the `paths` option, since image lookups are performed relative to the file being rendered (by default), we may alter this with the option.

      stylus(str)
        .set('filename', __dirname + '/css/test.styl')
        .define('url', stylus.url())
        .render(function(err, css){
    
        });

For example if our images live in `./public/images` and we wish to use `url(images/tobi.png)`, we can pass `paths` with our public directory, which will become part of the lookup process. Like-wise if we wanted `url(tobi.png)` instead, we would pass `paths: [__dirname + '/public/images']`.

      stylus(str)
        .set('filename', __dirname + '/css/test.styl')
        .define('url', stylus.url({ paths: [__dirname + '/public'] }))
        .render(function(err, css){
          
        });
  
### Options

  - `limit` bytesize limit defaulting to 30Kb (30000)
  - `paths` image resolution path(s)