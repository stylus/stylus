
0.6.3 / 2011-02-22 
==================

  * Fixed single-ident selectors. Closes #142
  * Fixed cyclic __@import__ with file of the same name. Closes #143

0.6.2 / 2011-02-21 
==================

  * Added stylus(1) growl support when using `--watch`
  * Added __@import__ watching support to stylus(1). Closes #134
  * Changed; stylus(1) only throws when `--watch` is not used
  * Fixed `darken-by()` BIF
  * Fixed __@import__ literal semi-colon. Closes #140

0.6.1 / 2011-02-18 
==================

  * Fixed evaluation of nodes after a return. Closes #139

0.6.0 / 2011-02-18 
==================

  * Added `stylus(1)` direct css to stylus file conversion [Mario]
    For example instead of `$ stylus --css < foo.css > foo.styl`
    you may now either `$ stylus --css foo.css` or provide
    a destination path `$ stylus --css foo.css /tmp/out.styl`.

  * Added postfix conditionals. Closes #74
    Expressive ruby-ish syntax, ex: `padding 5px if allow-padding`.

0.5.3 / 2011-02-17 
==================

  * Added `in` operator. `3 in nums`, `padding in props` etc
  * Added `Expression#hash`, hashing all of the nodes in order
  * Added tests for conditionals with braces. Closes #136
  * Fixed ids that are also valid colors. Closes #137

0.5.2 / 2011-02-15 
==================

  * Fixed spaces after "}" with css-style. Closes #131
  * Fixed single-line css-style support. Closes #130

0.5.1 / 2011-02-11 
==================

  * Fixed mixin property ordering. Closes #125

0.5.0 / 2011-02-09 
==================

  * Added `lighten-by()` BIF
  * Added `darken-by()` BIF

0.4.1 / 2011-02-09 
==================

  * Added support for function definition braces
  * Fixed issue with invalid color output. Closes #127

0.4.0 / 2011-02-07 
==================

  * Added css-style syntax support
  * Fixed support for `*` selector within __@media__ blocks

0.3.1 / 2011-02-04 
==================

  * Fixed property disambiguation logic. Closes #117
    You no longer need to add a trailing comma when
    chaining selectors such as 'td:nth-child(2)\ntd:nth-child(3)'

0.3.0 / 2011-02-04 
==================

  * Added more assignment operators. Closes #77
    +=, -=, *=, /=, and %=

0.2.1 / 2011-02-02 
==================

  * Fixed `--compress` when passing files for stylus(1). Closes #115
  * Fixed bug preventing absolute paths from being passed to `@import`
  * Fixed `opposite-position()` with nested expressions, unwrapping
  * Fixed a couple global var leaks [aheckmann]

0.2.0 / 2011-02-01 
==================

  * Added; `url()` utilizing general lookup paths.
    This means that `{ paths: [] }` is optional now, as lookups
    will be relative to the file being rendered by default.

  * Added `-w, --watch` support to stylus(1). Closes #113

0.1.0 / 2011-02-01 
==================

  * Added `opposite-position(positions)` built-in function
  * Added `image-lookup(path)` built-in function
  * Added `-o, --out <dir>` support to stylus(1)
  * Added `stylus [file|dir ...]` support
  * Added; defaulting paths to `[CWD]` for stylus(1)
  * Changed; `unquote()` using `Literal` node
  * Changed; utilizing `Literal` in place of some `Ident`s

0.0.2 / 2011-01-31 
==================

  * Added optional property colon support. Closes #110
  * Added `--version` to stylus(1) 

0.0.1 / 2011-01-31 
==================

  * Initial release