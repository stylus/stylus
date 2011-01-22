
# Stylus

 Stylus is a revolutionary new language, providing an efficient, dynamic, and expressive way to generate CSS.

### Example

    border-radius(n)
      -webkit-border-radius n
      -moz-border-radius n
      border-radius n

    body a
      font 12px "Lucida Grande", Arial, sans-serif
      background black
      color #ccc

    form input
      padding 5px
      border 1px solid
      border-radius 5px

compiles to:

    body a {
      font: 12px "Lucida Grande", Arial, sans-serif;
      background: #000;
      color: #ccc;
    }
    form input {
      padding: 5px;
      border: 1px solid;
      -webkit-border-radius: 5px;
      -moz-border-radius: 5px;
      border-radius: 5px;
    }

### Features

 Stylus has _many_ features, click the links below for detailed documentation.

  - [mixins](stylus/blob/master/docs/mixins.md)
  - [variables](stylus/blob/master/docs/variables.md)
  - arithmetic, logical, and equality [operators](stylus/blob/master/docs/operators.md)
  - type coercion
  - [conditionals](stylus/blob/master/docs/conditionals.md)
  - nested [selectors](stylus/blob/master/docs/selectors.md)
  - parent reference
  - in-language [functions](stylus/blob/master/docs/functions.md)
  - optional [image inlining](stylus/blob/master/docs/functions.url.md)
  - optional compression
  - JavaScript [API](stylus/blob/master/docs/js.md)
  - built-in [functions](stylus/blob/master/docs/bifs.md) (over 25)
  - extremely terse syntax
  - stylus [executable](stylus/blob/master/docs/executable.md)
  - [error reporting](stylus/blob/master/docs/error-reporting.md)
  - single-line and multi-line [comments](stylus/blob/master/docs/comments.md)

### Import

 Literal css import:
 
    @import "foo.css"

compiles to:

    @import "foo.css"

 Import of _.styl_ files should omit the extension, resolving to _mixins.styl_ in this case. Functions, mixins, selectors etc can all be contained within imported files.
 
    @import "mixins"

### Literal CSS

 If for any reason Stylus cannot accommodate a specific need, you can always resort to literal css via `@css`:
 
     
     @css {
       body {
         font: 14px;
       }
     }

compiling to:

    body {
      font: 14px;
    }
    

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