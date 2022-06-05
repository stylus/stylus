---
layout: default
permalink: docs/executable.html
---

# Get styling with Stylus

Installing Stylus is very easy once you have [Node.js](https://nodejs.org/).
So get the binaries for your platform and make sure that they also include npm, Node's package manager.

Now, type in your terminal:

```bash
# npm
$ npm install stylus -g

# pnpm
$ pnpm add -g stylus
```

If you want an expressive css language for nodejs with these
features or the features listed below, head over to 
[GitHub](https://github.com/stylus/stylus)
for more information.

## Stylus cli

Stylus ships with the `stylus` executable for converting Stylus to CSS.

```bash
Usage: stylus [options] [command] [< in [> out]]
              [file|dir ...]

Commands:

  help [<type>:]<prop> Opens help info at MDC for <prop> in
                        your default browser. Optionally
                        searches other resources of <type>:
                        safari opera w3c ms caniuse quirksmode

Options:

  -i, --interactive       Start interactive REPL
  -u, --use <path>        Utilize the Stylus plugin at <path>
  -U, --inline            Utilize image inlining via data URI support
  -w, --watch             Watch file(s) for changes and re-compile
  -o, --out <dir>         Output to <dir> when passing files
  -C, --css <src> [dest]  Convert CSS input to Stylus
  -I, --include <path>    Add <path> to lookup paths
  -c, --compress          Compress CSS output
  -d, --compare           Display input along with output
  -f, --firebug           Emits debug infos in the generated CSS that
                          can be used by the FireStylus Firebug plugin
  -l, --line-numbers      Emits comments in the generated CSS
                          indicating the corresponding Stylus line
  -m, --sourcemap         Generates a sourcemap in sourcemaps v3 format
  --sourcemap-inline      Inlines sourcemap with full source text in base64 format
  --sourcemap-root <url>  "sourceRoot" property of the generated sourcemap
  --sourcemap-base <path> Base <path> from which sourcemap and all sources are relative
  -P, --prefix [prefix]   Prefix all css classes
  -p, --print             Print out the compiled CSS
  --import <file>         Import stylus <file>
  --include-css           Include regular CSS on @import
  -D, --deps              Display dependencies of the compiled file
  --disable-cache         Disable caching
  --hoist-atrules         Move @import and @charset to the top
  -r, --resolve-url       Resolve relative urls inside imports
  --resolve-url-nocheck   Like --resolve-url but without file existence check
  -V, --version           Display the version of Stylus
  -h, --help              Display help information
```
## STDIO Compilation Example

`stylus` reads from _stdin_ and outputs to _stdout_, so for example:

```bash
$ stylus --compress < some.styl > some.css
```

Try Stylus some in the terminal!  Type below and press `CTRL-D` for `__EOF__`:

```bash
$ stylus
body
  color red
  font 14px Arial, sans-serif
```

## Compiling Files Example

`stylus` also accepts files and directories. For example, a directory named `css` will compile and output `.css` files in the same directory.

```bash
$ stylus css
```

The following will output to `./public/stylesheets`:

```bash
$ stylus css --out public/stylesheets
```

Or a few files:

```bash
$ stylus one.styl two.styl
```

For development purposes, you can use the `linenos` option to emit comments indicating
the Stylus filename and line number in the generated CSS:

```bash
$ stylus --line-numbers <path>
```
Or the `firebug` option if you want to use
the [FireStylus extension for Firebug](/docs/firebug.md):

```bash
$ stylus --firebug <path>
```

## Prefixing classes

`stylus` executable provides you a way to prefix all the generated styles using `--prefix` option with given `[prefix]`,

```bash
$ stylus --prefix foo-
```

used with this code:

```stylus
.bar
  width: 10px
```

would yield

```css
.foo-bar {
  width: 10px;
}
```

All the classes would be prefixed: interpolated, extended etc.

## Converting CSS

If you wish to convert CSS to the terse Stylus syntax, use the `--css` flag.

Via stdio:

```bash
$ stylus --css < test.css > test.styl
```

Output a `.styl` file of the same basename:

```stylus
$ stylus --css test.css
```

Output to a specific destination:

```stylus
$ stylus --css test.css /tmp/out.styl
```

## CSS Property Help

On OS X, `stylus help <prop>` will open your default browser and display help documentation for the given `<prop>`.

```stylus
$ stylus help box-shadow
```

## Interactive Shell

The Stylus REPL (Read-Eval-Print-Loop) or "interactive shell" allows you to
play around with Stylus expressions directly from your terminal.

**Note that this works only for expressions**—not selectors, etc. To use simple add the `-i`, or `--interactive` flag:

```bash
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
```

## Resolving relative urls inside imports

By default Stylus don't resolve the urls in imported `.styl` files, so if you'd happen to have a `foo.styl` with `@import "bar/bar.styl"` which would have `url("baz.png")`, it would be `url("baz.png")` too in a resulting CSS.

But you can alter this behavior by using `--resolve-url` (or just `-r`) option to get `url("bar/baz.png")` in your resulting CSS.

## List dependencies

You can use `--deps` (or just `-D`) flag to get a list of dependencies of the compiled file.

For example, suppose we have `test.styl`:

```stylus
@import 'foo'
@import 'bar'
```

And inside `foo.styl`:

```stylus
@import 'baz'
```

Running:

```stylus
$ stylus --deps test.styl
```

Will give us list of the imports paths:

```bash
foo.styl
baz.styl
bar.styl
```

**Note that currently this does not works for dynamically generated paths**.

## Utilizing Plugins

For this example we'll use the [nib](https://github.com/visionmedia/nib) Stylus plugin to illustrate its CLI usage.

Suppose we have the following Stylus, which imports nib to use its `linear-gradient()` function.

```stylus
@import 'nib'

body
  background: linear-gradient(20px top, white, black)
```

Our first attempt to render using `stylus(1)` via stdio might look like this:

```bash
$ stylus < test.styl
```

Which would yield the following error (because Stylus doesn't know where to find nib).

```bash
Error: stdin:3
  1|
  2|
> 3| @import 'nib'
  4|
  5| body
  6|   background: linear-gradient(20px top, white, black)
```

For plugins that simply supply Stylus APIs, we could add the path to the Stylus lookup paths.  We do so by using the `--include` or `-I` flag:

```bash
$ stylus < test.styl --include ../nib/lib
```

Now yielding the output below. (As you might notice, calls to `gradient-data-uri()` and `create-gradient-image()` output as literals. This is because exposing the library path isn't enough when a plugin provides a JavaScript API.  However, if we only wanted to use pure-Stylus nib functions, we'd be fine.)

```css
body {
  background: url(gradient-data-uri(create-gradient-image(20px, top)));
  background: -webkit-gradient(linear, left top, left bottom, color-stop(0, #fff), color-stop(1, #000));
  background: -webkit-linear-gradient(top, #fff 0%, #000 100%);
  background: -moz-linear-gradient(top, #fff 0%, #000 100%);
  background: linear-gradient(top, #fff 0%, #000 100%);
}
```
So, what we need to do is use the `--use`, or `-u` flag.  It expects a path to a node module (with or without the `.js` extension). This `require()`s the module, expecting a function to be exported as `module.exports`, which then calls `style.use(fn())` to expose the plugin (defining its js functions, etc.).

```bash
$ stylus < test.styl --use ../nib/lib/nib
```

Yielding the expected result:

```css
body {
  background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAUCAYAAABMDlehAAAABmJLR0QA/wD/AP+gvaeTAAAAI0lEQVQImWP4+fPnf6bPnz8zMH358oUBwkIjKJBgYGNj+w8Aphk4blt0EcMAAAAASUVORK5CYII=");
  background: -webkit-gradient(linear, left top, left bottom, color-stop(0, #fff), color-stop(1, #000));
  background: -webkit-linear-gradient(top, #fff 0%, #000 100%);
  background: -moz-linear-gradient(top, #fff 0%, #000 100%);
  background: linear-gradient(top, #fff 0%, #000 100%);
}
```

If you need to pass arguments to the plugin, use the `--with` option. `--with` evaluates any valid javascript expression and passes its value to the plugin. For example:

```stylus
$ stylus < test.styl --use ../node_modules/autoprefixer-stylus --with "{ browsers: ['ie 7', 'ie 8'] }"
```
