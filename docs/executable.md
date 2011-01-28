
## Stylus Executable

Stylus ships with the `stylus` executable for converting stylus to css.


    Usage: stylus [options] [command] [< in [> out]]

    Commands:

      help <prop>     Opens help info for <prop> in
                      your default browser. (osx only)

    Options:

      -c, --css       Convert css input to stylus
      -C, --compress  Compress css output
      -d, --compare   Display input along with output
      -h, --help      Display help information


### Compilation Example

 `stylus` reads from _stdin_ and outputs to _stdout_, so for example:

      $ stylus --compress < some.styl > some.css

Try stylus some in the terminal, type below and press CTRL-D for __EOF__:

      $ stylus
      body
        color red
        font 14px Arial, sans-serif

### CSS Property Help

  On osx `stylus help <prop>` will open your default browser and display help documentation for the given `<prop>`.

    $ stylus help box-shadow


