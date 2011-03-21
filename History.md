
0.9.2 / 2011-03-21 
==================

  * Removed a `console.log()` call

0.9.1 / 2011-03-18 
==================

  * Fixed connect middleware `@import` support. Closes #168
    The middleware is now smart enough to know when imports
    change, and will re-compile the target file.

  * Changed middleware `compile` function to return the `Renderer` (API change)

0.9.0 / 2011-03-18 
==================

  * Added `-i, --interactive` for the Stylus REPL (eval stylus expressions, tab-completion etc)
  * Added link to vim syntax
  * Changed `p()` built-in to display parens
  * Changed `--compress -C` to `-c`, and `-css -c` is now `-C`
  * Fixed; preserve rest-arg expressions. Closes #194
  * Fixed `*=` in selector, ex `[class*="foo"]`
  * Fixed `--watch` issue with growl, updated to 1.1.0. Closes #188
  * Fixed negative floats when compressed. Closes #193 [reported by ludicco]

0.8.0 / 2011-03-14 
==================

  * Added postfix `for`-loop support.
    Ex: `return n if n % 2 == 0 for n in nums` 
  * Added support for several postfix operators
    Ex: `border-radius: 5px if true unless false;`
  * Added `last(expr)` built-in function
  * Added `sum(nums)` built-in function
  * Added `avg(nums)` built-in function
  * Added `join(delim, vals)` built-in function
  * Added `Evaluator#{currentScope,currentBlock}`
  * Added multi-line function paramter definition support
  * Changed; `0` is falsey, `0%`, `0em`, `0px` etc truthy. Closes #160
  * Fixed `for` implicit __return__ value
  * Fixed `for` explicit __return__ value
  * Fixed mixin property ordering

0.7.4 / 2011-03-10 
==================

  * Added `RGBA` node
  * Added `is a "color"` special-case, true for `HSLA` and `RGBA` nodes.
Closes #180
  * Performance; 2.5x faster compiles due to removing use of getters in `Parser` and `Lexer` (yes, they are really slow).
  * Removed `Color` node
  * Fixed stylus(1) `--watch` support due to dynamic __@import__ support. Closes #176

0.7.3 / 2011-03-09 
==================

  * Fixed; allow semi-colons for non-css syntax for one-liners

0.7.2 / 2011-03-08 
==================

  * Added `isnt` operator, same as `is not`, and `!=`
  * Added support for dynamic `@import` expressions
  * Added `@import` index resolution support
  * Added `light()` / `dark()` BIFs
  * Added `compress` option for connect middleware [disfated]
  * Changed; most built-in functions defined in stylus (`./lib/functions/index.styl`)
  * Fixed dynamic expressions in `url()`. Closes #105

0.7.1 / 2011-03-07 
==================

  * Fixed connect middleware for 0.4.x

0.7.0 / 2011-03-02 
==================

  * Added `is` and `is not` aliases for `==` and `!=`
  * Added __@keyframes__ dynamic name support
  * Fixed units in interpolation
  * Fixed clamping of HSLA degrees / percentages

0.6.7 / 2011-03-01 
==================

  * Fixed __RGBA__ -> __HSLA__ conversion due to typo

0.6.6 / 2011-03-01 
==================

  * Added string -> unit type coercion support aka `5px + "10"` will give `15px`
  * Added `warn` option Closes #152
    Currently this only reports on re-definition of functions
  * Added '$' as a valid identifier character
  * Added `mixin` local variable for function introspection capabilities. Closes #162
  * Fixed typo, `Unit#toBoolean()` is now correct
  * Fixed interpolation function calls. Closes #156
  * Fixed mixins within Media node. Closes #153
  * Fixed function call in ret val. Closes #154

0.6.5 / 2011-02-24 
==================

  * Fixed parent ref `&` mid-selector bug. Closes #148 [reported by visnu]

0.6.4 / 2011-02-24 
==================

  * Fixed for within brackets. Closes #146

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