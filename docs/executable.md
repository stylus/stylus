
## Stylus Executable

Stylus ships with the `stylus` executable for converting Stylus to CSS.

      Usage: stylus [options] [command] [< in [> out]]
                    [file|dir ...]

      Commands:

        help <prop>     Opens help info for <prop> in
                        your default browser. (OS X only)

      Options:

        -u, --use <path>        Utilize the stylus plugin at <path>
        -i, --interactive       Start interactive REPL
        -w, --watch             Watch file(s) for changes and re-compile
        -o, --out <dir>         Output to <dir> when passing files
        -C, --css <src> [dest]  Convert CSS input to Stylus
        -I, --include <path>    Add <path> to lookup paths
        -c, --compress          Compress CSS output
        -d, --compare           Display input along with output
        -f, --firebug           Emits debug infos in the generated css that
                                can be used by the FireStylus Firebug plugin
        -l, --line-numbers      Emits comments in the generated CSS
                                indicating the corresponding Stylus line
        -V, --version           Display the version of Stylus
        -h, --help              Display help information

### STDIO Compilation Example

 `stylus` reads from _stdin_ and outputs to _stdout_, so for example:

      $ stylus --compress < some.styl > some.css

Try Stylus some in the terminal!  Type below and press `CTRL-D` for `__EOF__`:

      $ stylus
      body
        color red
        font 14px Arial, sans-serif

### Compiling Files Example

 `stylus` also accepts files and directories. For example, a directory named `css` will compile and output `.css` files in the same directory.
 
      $ stylus css

  The following will output to `./public/stylesheets`:

      $ stylus css --out public/stylesheets

  Or a few files:

      $ stylus one.styl two.styl

  For development purposes, you can use the `linenos` option to emit comments indicating 
  the Stylus filename and line number in the generated CSS:

      $ stylus --line-numbers <path>

  Or the `firebug` option if you want to use
  the [FireStylus extension for Firebug](//github.com/LearnBoost/stylus/blob/master/docs/firebug.md):

      $ stylus --firebug <path>

### Converting CSS

 If you wish to convert CSS to the terse Stylus syntax, use the `--css` flag.

 Via stdio:
 
      $ stylus --css < test.css > test.styl

 Output a `.styl` file of the same basename:
 
      $ stylus --css test.css

 Output to a specific destination:
 
      $ stylus --css test.css /tmp/out.styl

### CSS Property Help

  On OS X, `stylus help <prop>` will open your default browser and display help documentation for the given `<prop>`.

    $ stylus help box-shadow

### Interactive Shell

 The Stylus REPL (Read-Eval-Print-Loop) or "interactive shell" allows you to
 play around with Stylus expressions directly from your terminal. 
 
 **Note that this works only for expressions**—not selectors, etc. To use simple add the `-i`, or `--interactive` flag:
 
     $ stylus -i
     > color = white
     => #fff
     > color - rgb(200,50,0)
     => #37cdff
     > color
     => #fff
     > color -= rgb(200,50,0)
     => #37cdff
     > color
     => #37cdff
     > rgba(color, 0.5)
     => rgba(55,205,255,0.5)

### Utilizing Plugins

 For this example we'l use the [nib](https://github.com/visionmedia/nib) Stylus plugin to illustrate its CLI usage. 
 
 Suppose we have the following Stylus, which imports nib to use its `linear-gradient()` function.
 
     @import 'nib'

     body
       background: linear-gradient(20px top, white, black) 

 Our first attempt to render using `stylus(1)` via stdio might look like this:
 
     $ stylus < test.styl

 Which would yield the following error (because Stylus doesn't know where to find nib).

       Error: stdin:3
          1| 
          2| 
        > 3| @import 'nib'
          4| 
          5| body
          6|   background: linear-gradient(20px top, white, black)

  For plugins that simply supply Stylus APIs, we could add the path to the Stylus lookup paths.  We do so by using the `--include` or `-I` flag:

     $ stylus < test.styl --include ../nib/lib

  Now yielding the output below. (As you might notice, calls to `gradient-data-uri()` and `create-gradient-image()` output as literals. This is because exposing the library path isn't enough when a plugin provides a JavaScript API.  However, if we only wanted to use pure-Stylus nib functions, we'd be fine.)

      body {
        background: url(gradient-data-uri(create-gradient-image(20px, top)));
        background: -webkit-gradient(linear, left top, left bottom, color-stop(0, #fff), color-stop(1, #000));
        background: -webkit-linear-gradient(top, #fff 0%, #000 100%);
        background: -moz-linear-gradient(top, #fff 0%, #000 100%);
        background: linear-gradient(top, #fff 0%, #000 100%);
      }

  So, what we need to do is use the `--use`, or `-u` flag.  It expects a path to a node module (with or without the `.js` extension). This `require()`s the module, expecting a function to be exported as `module.exports`, which then calls `style.use(fn())` to expose the plugin (defining its js functions, etc.).
  
    $ stylus < test.styl --use ../nib/lib/nib

 Yielding the expected result:

    body {
      background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAUCAYAAABMDlehAAAABmJLR0QA/wD/AP+gvaeTAAAAI0lEQVQImWP4+fPnf6bPnz8zMH358oUBwkIjKJBgYGNj+w8Aphk4blt0EcMAAAAASUVORK5CYII=");
      background: -webkit-gradient(linear, left top, left bottom, color-stop(0, #fff), color-stop(1, #000));
      background: -webkit-linear-gradient(top, #fff 0%, #000 100%);
      background: -moz-linear-gradient(top, #fff 0%, #000 100%);
      background: linear-gradient(top, #fff 0%, #000 100%);
    }
  
