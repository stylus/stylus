
## Stylus Executable

Stylus ships with the `stylus` executable for converting stylus to css.

      Usage: stylus [options] [command] [< in [> out]]
                    [file|dir ...]

      Commands:

        help <prop>     Opens help info for <prop> in
                        your default browser. (osx only)

      Options:

        -i, --interactive       Start interactive REPL
        -w, --watch             Watch file(s) for changes and re-compile
        -o, --out <dir>         Output to <dir> when passing files
        -C, --css <src> [dest]  Convert css input to stylus
        -c, --compress          Compress css output
        -d, --compare           Display input along with output
        -V, --version           Display the version of stylus
        -h, --help              Display help information

### STDIO Compilation Example

 `stylus` reads from _stdin_ and outputs to _stdout_, so for example:

      $ stylus --compress < some.styl > some.css

Try stylus some in the terminal, type below and press CTRL-D for __EOF__:

      $ stylus
      body
        color red
        font 14px Arial, sans-serif

### Compiling Files Example

 `stylus` also accepts files and directories, for example a directory named `css` will compile and output the `.css` files in the same directory.
 
      $ stylus css

  The following will output to `./public/stylesheets`:
  
      $ stylus css --out public/stylesheets

  Or a few files:
  
      $ stylus one.styl two.styl

### Converting CSS

 If we wish to convert css to the terse Stylus syntax, we can utilize the `--css` flag.

 Via stdio:
 
      $ stylus --css < test.css > test.styl

 Output a `.styl` file of the same basename:
 
      $ stylus --css test.css

 Output to a specific destination:
 
      $ stylus --css test.css /tmp/out.styl

### CSS Property Help

  On osx `stylus help <prop>` will open your default browser and display help documentation for the given `<prop>`.

    $ stylus help box-shadow

### Interactive Shell

 The Stylus REPL (Read-Eval-Print-Loop) or "interactive shell" allows you to
 play around with Stylus expressions directly from your terminal. Note that this works only for expressions, not selectors etc. To use simple add the `-i`, or `--interactive` flag:
 
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
 