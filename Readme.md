<p align="center"><a href="https://stylus-lang.com" target="_blank" rel="noopener noreferrer"><img width="150" src="https://raw.githubusercontent.com/stylus/stylus/dev/graphics/Logos/stylus.png" alt="Stylus logo"></a></p>

[![Build Status](https://github.com/stylus/stylus/actions/workflows/ci.yml/badge.svg?branch=dev)](https://github.com/stylus/stylus/actions?query=branch%3Adev)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-brightgreen.svg)](https://github.com/stylus/stylus/pulse)
[![npm version](https://img.shields.io/npm/v/stylus?color=brightgreen)](https://www.npmjs.com/package/stylus)
[![npm](https://img.shields.io/npm/dm/stylus.svg)](https://www.npmjs.com/package/stylus)
[![Join the community on github discussion](https://img.shields.io/badge/Join%20the%20community-on%20discussions-%23754ffb?logo=googlechat&logoColor=white)](https://github.com/stylus/stylus/discussions)

Stylus is a revolutionary new language, providing an efficient, dynamic, and expressive way to generate CSS. Supporting both an indented syntax and regular CSS style.

## Installation

```bash
$ npm install stylus -g
```

## Basic Usage
Watch and compile a stylus file from command line with 
```bash
stylus -w style.styl -o style.css
```
You can also [try all stylus features on stylus-lang.com](http://stylus-lang.com/try.html), build something with stylus on [codepen](http://codepen.io) or [RunKit](https://npm.runkit.com/stylus)

### IDE/Editor Support

| IDE/Editor | built-in support | guide | plugin support |
| ------------- | ------------- |  ------------- |   ------------- |
| <img src="https://simpleicons.org/icons/webstorm.svg" width="15px" /> WebStorm | ✅ &nbsp;[bug report](https://youtrack.jetbrains.com/issues/WEB) | [Using stylus with webstorm](https://www.jetbrains.com/help/webstorm/transpiling-stylus-to-css.html) | N/A  |
| <img src="https://simpleicons.org/icons/visualstudiocode.svg" width="15px" /> VSCode | ❌ | N/A | [Stylus](https://marketplace.visualstudio.com/items?itemName=sysoev.language-stylus)(maintainer: [@iChenLei](https://github.com/ichenlei) [@d4rkr00t](https://github.com/d4rkr00t))  |
| <img src="https://simpleicons.org/icons/sublimetext.svg" width="15px" /> Sublime 2/3 | ❌ | N/A |[Stylus](https://packagecontrol.io/packages/Stylus)(maintainer: [@billymoon](https://github.com/billymoon))  |
| <img src="https://simpleicons.org/icons/atom.svg" width="15px" /> Atom | ❌ | N/A | [Stylus](https://atom.io/packages/stylus)(maintainer: [@matthojo](https://github.com/matthojo)) |
| <img src="https://simpleicons.org/icons/vim.svg" width="15px" /> Vim | ❌ | N/A | [vim-stylus](https://github.com/iloginow/vim-stylus)(maintainer: [@iloginow](https://github.com/iloginow)) |

> Missing your favorite IDE/Editor support ? Please report to us via [stylus issues](https://github.com/stylus/stylus/issues)

### Modern bundler/task-runner Support

| Bundler | built-in support | guide | plugin support |
| ------------- | ------------- |  ------------- |  ------------- |
| <img src="https://simpleicons.org/icons/webpack.svg" width="15px"> webpack | ✅ | [Using stylus with webpack](https://webpack.js.org/loaders/stylus-loader/) | [stylus-loader](https://github.com/webpack-contrib/stylus-loader) |
| <img src="https://simpleicons.org/icons/vite.svg" width="15px"> vite | ✅  | [Using stylus with vite](https://vitejs.dev/guide/features.html#css-pre-processors) |  N/A |
| <img src="https://avatars.githubusercontent.com/u/32607881?s=20&v=4" width="15px"> parcel | ✅  | [Using stylus with parcel v1](https://parceljs.org/stylus.html) \| [v2](https://v2.parceljs.org/languages/stylus/) | N/A |
| <img src="https://avatars.githubusercontent.com/u/23119087?s=20&v=4" width="15px"> fuse-box | ✅  | [Using stylus with fuse-box](https://fuse-box.org/docs/plugins/stylus-plugin) | N/A |
| <img src="https://avatars.githubusercontent.com/u/44914786?s=20&v=4" width="15px"> snowpack | ❌  | [Snowpack plugins guide](https://www.snowpack.dev/reference/plugins) |  [snowpack-plugin-stylus](https://github.com/fansenze/snowpack-plugin-stylus) |
| <img src="https://simpleicons.org/icons/gulp.svg" width="15px"> gulp | ❌  | N/A | [gulp-stylus](https://github.com/stevelacy/gulp-stylus) |
| <img src="https://simpleicons.org/icons/grunt.svg" width="15px"> grunt | ❌  | N/A | [grunt-contrib-stylus](https://github.com/gruntjs/grunt-contrib-stylus) |
| <img src="https://simpleicons.org/icons/rollupdotjs.svg" width="15px"> rollup | ❌ | N/A | [rollup-plugin-stylus-compiler](https://github.com/RJHwang/rollup-plugin-stylus-compiler) |


> Missing your favorite modern bundler/task-runner support ? Please report to us via [stylus issues](https://github.com/stylus/stylus/issues)

### Example

```stylus
border-radius()
  -webkit-border-radius: arguments
  -moz-border-radius: arguments
  border-radius: arguments

body a
  font: 12px/1.4 "Lucida Grande", Arial, sans-serif
  background: black
  color: #ccc

form input
  padding: 5px
  border: 1px solid
  border-radius: 5px
```

compiles to:

```css
body a {
  font: 12px/1.4 "Lucida Grande", Arial, sans-serif;
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
```

the following is equivalent to the indented version of Stylus source, using the CSS syntax instead:

```stylus
border-radius() {
  -webkit-border-radius: arguments
  -moz-border-radius: arguments
  border-radius: arguments
}

body a {
  font: 12px/1.4 "Lucida Grande", Arial, sans-serif;
  background: black;
  color: #ccc;
}

form input {
  padding: 5px;
  border: 1px solid;
  border-radius: 5px;
}
```

### Features

 Stylus has _many_ features.  Detailed documentation links follow:

  - [css syntax](docs/css-style.md) support
  - [mixins](docs/mixins.md)
  - [keyword arguments](docs/kwargs.md)
  - [variables](docs/variables.md)
  - [interpolation](docs/interpolation.md)
  - arithmetic, logical, and equality [operators](docs/operators.md)
  - [importing](docs/import.md) of other stylus sheets
  - [introspection api](docs/introspection.md)
  - type coercion
  - [@extend](docs/extend.md)
  - [conditionals](docs/conditionals.md)
  - [iteration](docs/iteration.md)
  - nested [selectors](docs/selectors.md)
  - parent reference
  - in-language [functions](docs/functions.md)
  - [variable arguments](docs/vargs.md)
  - built-in [functions](docs/bifs.md) (over 60)
  - optional [image inlining](docs/functions.url.md)
  - optional compression
  - JavaScript [API](docs/js.md)
  - extremely terse syntax
  - stylus [executable](docs/executable.md)
  - [error reporting](docs/error-reporting.md)
  - single-line and multi-line [comments](docs/comments.md)
  - css [literal](docs/literal.md)
  - character [escaping](docs/escape.md)
  - [@keyframes](docs/keyframes.md) support & expansion
  - [@font-face](docs/font-face.md) support
  - [@media](docs/media.md) support
  - Connect [Middleware](docs/middleware.md)
  - TextMate [bundle](docs/textmate.md)
  - Coda/SubEtha Edit [Syntax mode](https://github.com/atljeremy/Stylus.mode)
  - gedit [language-spec](docs/gedit.md)
  - VIM [Syntax](https://github.com/iloginow/vim-stylus)
  - Espresso [Sugar](https://github.com/aljs/Stylus.sugar)
  - [Firebug extension](docs/firebug.md)
  - heroku [web service](http://styl.herokuapp.com/) for compiling stylus
  - [style guide](https://github.com/lepture/ganam) parser and generator
  - transparent vendor-specific function expansion

### Community modules

  - https://github.com/stylus/stylus/wiki

### Stylus cheatsheet

  - [Stylus cheatsheet](https://devhints.io/stylus), very useful stylus syntax code snippet for you

### Authors

  - [TJ Holowaychuk (tj)](https://github.com/tj)

### More Information

  - Language [comparisons](docs/compare.md), compare Less Sass and Stylus.

## Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](Code_of_Conduct.md). By participating in this project you agree to abide by its terms.

## License 

(The MIT License)

Copyright (c) Automattic &lt;developer.wordpress.com&gt;

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
