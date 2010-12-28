
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