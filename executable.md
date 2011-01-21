## Stylus Executable

Stylus ships with the `stylus` executable for converting stylus to css. `stylus` reads from _stdin_ and outputs to _stdout_, so for example:

    $ stylus --compress < some.styl > some.css

Try stylus some in the terminal, type below and press CTRL-D for __EOF__:

    $ stylus
    body
      color red
      font 14px Arial, sans-serif


For more information view:

    $ stylus --help