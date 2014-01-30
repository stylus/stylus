## Data URI Image Inlining

Stylus is bundled with an optional function named `url()`, which replaces the literal `url()` calls (and conditionally inlines them using base64 [Data URIs](http://en.wikipedia.org/wiki/Data_URI_scheme)).

### Example

The function itself is available via `require('stylus').url`. It accepts an `options` object, returning a function that Stylus calls internally when it sees `url()`.

The `.define(name, callback)` method assigned a JavaScript function that can be called from Stylus source. In this case, since our images are in `./css/images`,  we can ignore the `paths` option (by default image lookups are performed relative to the file being rendered).  But if desired, this behavior can be altered:

      stylus(str)
        .set('filename', __dirname + '/css/test.styl')
        .define('url', stylus.url())
        .render(function(err, css){
    
        });

For example, imagine our images live in `./public/images`.  We want to use `url(images/tobi.png)`.  We could pass `paths` our public directory, so that it becomes part of the lookup process. 

Likewise, if instead we wanted `url(tobi.png)`, we could pass `paths: [__dirname + '/public/images']`.

      stylus(str)
        .set('filename', __dirname + '/css/test.styl')
        .define('url', stylus.url({ paths: [__dirname + '/public'] }))
        .render(function(err, css){
          
        });
  
### Options

  - `limit` bytesize limit defaulting to 30Kb (30000)
  - `paths` image resolution path(s)