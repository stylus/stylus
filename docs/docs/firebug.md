---
layout: default
permalink: docs/firebug.html
---

# FireStylus extension for Firebug

[FireStylus](https://github.com/parallel/firestylus) is a Firebug extension 
that makes Firebug display the Stylus filename and line numbers of 
the Stylus-generated CSS styles rather than those of the generated CSS.

![Screenshot](https://raw.github.com/parallel/firestylus/master/src/chrome/skin/screenshot.png)

## Usage

First, you need to install [Firebug](https://addons.mozilla.org/firefox/downloads/latest/1843/addon-1843-latest.xpi?src=addondetail)
and the [FireStylus extension](https://github.com/parallel/firestylus)

Then simply enable the Stylus's `firebug` option when generating CSS.

Command line usage:

```bash
$ stylus -f <path>
$ stylus --firebug <path>
```
Javascript usage:

```css
var stylus = require('stylus');

stylus(str)
  .set('firebug', true)
  .render(function(err, css){
  // logic
  });
```

Connect / Express:

```css
var stylus = require('stylus');

var server = connect.createServer(
    stylus.middleware({
        src: __dirname
      , dest: __dirname + '/public'
      , firebug: true
    })
  , connect.static(__dirname + '/public')
);
```

## Compatibility

FireStylus should work with Firefox versions 3.0 and up, and with Firebug versions 1.4 and up.

- Firefox 3+ (also works with version 5)
- Firebug 1.4+

## Limitations

FireStylus and FireSass are incompatible. You cannot enable them
simultaneously.

FireStylus (like FireSass) only works in the HTML pane of Firebug. The others
(such as the CSS pane) won't work due to Firebug limitations.
