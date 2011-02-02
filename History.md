
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