---
layout: default
permalink: docs/escape.html
---

# Char Escaping

Stylus lets you escape characters. This effectively turns them into identifiers, allowing them to be rendered as literals. 
 
For example:

```stylus
body
  padding 1 \+ 2
```

Compiles to:

```css
body {
  padding: 1 + 2;
}
```

Note that Stylus requires that `/` is parenthesized when used in a property:

```stylus
body
  font 14px/1.4
  font (14px/1.4)
```

yields:

```css
body {
  font: 14px/1.4;
  font: 10px;
}
```
