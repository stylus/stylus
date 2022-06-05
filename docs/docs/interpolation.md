---
layout: default
permalink: docs/interpolation.html
---

# Interpolation

Stylus supports interpolation by using the `{}` characters to surround an expression, which then becomes part of the identifier. For example, `-webkit-{'border' + '-radius'}` evaluates to `-webkit-border-radius`.

A great example use-case for this is expanding properties with vendor prefixes.

```stylus
vendor(prop, args)
  -webkit-{prop} args
  -moz-{prop} args
  {prop} args

border-radius()
  vendor('border-radius', arguments)

box-shadow()
  vendor('box-shadow', arguments)

button
  border-radius 1px 2px / 3px 4px
```

Yields:

```css
button {
  -webkit-border-radius: 1px 2px / 3px 4px;
  -moz-border-radius: 1px 2px / 3px 4px;
  border-radius: 1px 2px / 3px 4px;
}
```

## Selector Interpolation

Interpolation works with selectors as well. For example, we may iterate to assign the `height` property for the first 5 rows in a table, as shown below:

```stylus
table
  for row in 1 2 3 4 5
    tr:nth-child({row})
      height: 10px * row
```

Yields:

```css
table tr:nth-child(1) {
  height: 10px;
}
table tr:nth-child(2) {
  height: 20px;
}
table tr:nth-child(3) {
  height: 30px;
}
table tr:nth-child(4) {
  height: 40px;
}
table tr:nth-child(5) {
  height: 50px;
}
```

You may also put together multiple selectors into one variable by building a string and interpolate them in place:

```stylus
mySelectors = '#foo,#bar,.baz'

{mySelectors}
  background: #000
```

Yields:

```css
#foo,
#bar,
.baz {
  background: #000;
}
```