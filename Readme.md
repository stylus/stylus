
# Stylus



### Example

    body a
      font 12px "Lucida Grande", Arial, sans-serif
      background black
      color #ccc

    form input
      padding 5px
      border 1px solid

compiles to:

    body a {
      font: 12px "Lucida Grande", Arial, sans-serif;
      background: #000;
      color: #ccc;
    }
    form input {
      padding: 5px;
      border: 1px solid;
    }

### Executable

Stylus ships with the `stylus` executable for converting stylus to css. `stylus` reads from _stdin_ and outputs to _stdout_, so for example:

    $ stylus --compress < some.styl > some.css

Try stylus some in the terminal, type below and press CTRL-D for __EOF__:

    $ stylus
    body
      color red
      font 14px Arial, sans-serif


View option help:

    $ stylus --help

### Indentation

Stylus is "pythonic" aka indentation-based. Whitespace is significant, so we substitute { and } with an indent, and and outdent as shown below:

    body
      color white

which compiles to:

    body {
      color: #fff;
    }


### Variables

We may assign expressions to variables and use them throughout our stylesheet:

     @font-size = 14px

     body
       font @font-size Arial, sans-serif

compiles to:

     body {
       font: 14px Arial, sans-serif;
     }

Variables can even consist of an expression list:

    @font-size = 14px
    @font = @font-size "Lucida Grande", Arial

    body
      font @font sans-serif

compiles to:

    body {
      font: 14px "Lucida Grande", Arial sans-serif;
    }

### Arithmetic

Stylus supports a plethora of operations on units, colors, and even strings.

Example string operations:

    body
      font "Ari" + "al"

compiles to:

    body {
      font: "Arial";
    }

Example unit operations:

    @size = 14px

    body
      font @size - 2

    a.large
      font @size * 2

compiles to:

    body {
      font: 12px;
    }
    a.large {
      font: 28px;
    }

Example color operations:

    body
      @base = #414141
      color @base
      background @base / 2
    a.button
      background #eee - rgba(0,0,0,0.5)

compiles to:

    body {
      color: #414141;
      background: #212121;
    }
    a.button {
      background: rgba(238,238,238,0.5);
    }

View the __Operators__ section for more information.

### Comments

Stylus supports both single-line and multi-line comments:

    // I'm a comment!
    
    /*
    
    Cat, I'm a kitty cat
    and I dance dance dance, and
    I dance dance dance.
    
    */

Neither are currently rendered.

### Mixins

Both mixins and functions are defined in the same manor, however they are applied in different ways. For example we have a `border-radius(n)` function defined below, which is invoked as a mixin aka a statement rather than part of an expression.

When `border-radius()` is invoked within a selector, the properties are expanded and copied into the selector.

    border-radius(@num)
      -webkit-border-radius @num
      -moz-border-radius @num
      border-radius @num

    form input[type=button]
      border-radius(5px)

compiles to:

    form input[type=button] {
      -webkit-border-radius: 5px;
      -moz-border-radius: 5px;
      -webkit-border-radius: 5px;
      -moz-border-radius: 5px;
      border-radius: 5px;
    }

When utilizing mixins, we can omit the parens all together, providing is with fantastic transparent vendor property support:

    border-radius(@num)
      -webkit-border-radius @num
      -moz-border-radius @num
      border-radius @num

    form input[type=button]
      border-radius 5px

Note that the `border-radius` within our mixin is treated as a property, and not a recursive function invocation.

### Functions

As mentioned above, functions are defined as before, however they have a return value. Below we define a function named `transparent()` which accepts a color, and defaults alpha to `0.5`. We can then use the `-` operator to substract the given alpha from our left-hand operand, resulting in the same color with lowered transparency. 

    transparent(@color, @alpha = 0.5)
      @color - rgba(0,0,0,@alpha)

    body
      color transparent(#eee)
      background transparent(#eee, 0.2)

compiles to:

    body {
      color: rgba(238,238,238,0.5);
      background: rgba(238,238,238,0.5);
    }

### JavaScript API

Simply require the module, and call `render()` with the given string of stylus code, and (optional) options object. Frameworks utilizing stylus should pass the `filename` option to provide better error reporting.

    var stylus = require('stylus');

    stylus.render(str, { filename: 'nesting.css' }, function(err, css){
      if (err) throw err;
      console.log(css);
    });

We can also do the same thing in a more progressive manor:

    var style = stylus(str)
      .set('filename', 'nesting.css')
      .render(function(err, css){
        // logic
      });

### Data URI Image Inlining

Stylus is bundled with an optional function named `url()`, which replaces the literal `url()` calls, and conditionally inlines them using base64 [Data URIs](http://en.wikipedia.org/wiki/Data_URI_scheme).

The function itself is available via `stylus.url`, and takes an options object. The `.define(name, callback)` method assigned a JavaScript function that can be called from stylus source. In this case we have our images in `./images`, so we simply pass the lookup paths array with `__dirname`, the dirname of the executing script, this array tells stylus where to attempt looking for your image.

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

## License 

(The MIT License)

Copyright (c) 2010 LearnBoost &lt;dev@learnboost.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.