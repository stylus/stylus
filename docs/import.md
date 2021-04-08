---
layout: default
permalink: docs/import.html
---

# @import and @require

Stylus supports both literal __@import__ for CSS, as well as dynamic importing or requiring of other Stylus sheets.

## Literal CSS

  Any filename with the extension `.css` will become a literal. For example:

     @import "reset.css"

Render the literal CSS __@import__ shown below:

     @import "reset.css"

## Stylus Import

*Disclaimer: In all places the __@import__ is used with Stylus sheets, the __@require__ could be used*

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

## Require

Along with `@import`, Stylus also has `@require`. It works almost in the same way, with the exception of importing any given file only once.

## Block-level import

Stylus supports block-level import. It means that you can use `@import` not only at root level, but also nested inside other selectors or at-rules.

If you have a `bar.styl` with this code:

    .bar
      width: 10px;

Then you can import it inside a `foo.styl` like this:

    .foo
      @import 'bar.styl'

    @media screen and (min-width: 640px)
      @import 'bar.styl'

And you'll get this compiled CSS as a result:

    .foo .bar {
      width: 10px;
    }
    @media screen and (min-width: 640px) {
      .bar {
        width: 10px;
      }
    }

## File globbing

Stylus supports [globbing](https://github.com/isaacs/node-glob#readme). With it you could import many files using a file mask:

    @import 'product/*'

This would import all the stylus sheets from the `product` directory in such structure:

    ./product
      |-- body.styl
      |-- foot.styl
      |-- head.styl

Note that this works with `@require` too, so if you would have also a `./product/index.styl` with this content:

    @require 'head'
    @require 'body'
    @require 'foot'

then `@require 'product/*'` would include each individual sheet only once.

## Resolving relative urls inside imports

By default Stylus doesn't resolve the urls in imported `.styl` files, so if you'd happen to have a `foo.styl` with `@import "bar/bar.styl"` which would have `url("baz.png")`, it would be `url("baz.png")` too in a resulting CSS.

But you can alter this behavior by using `--resolve-url` (or just `-r`) CLI option to get `url("bar/baz.png")` in your resulting CSS.

## JavaScript Import API

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

