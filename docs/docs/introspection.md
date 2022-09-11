---
layout: default
permalink: docs/introspection.html
---

# Introspection API

 Stylus supports an introspection API. This allows mixins and functions to reflect relative to the caller, etc.


## mixin

The `mixin` local variable is automatically assigned within function bodies.
It contains the string `root` if the function was called at the root
level, or `block` indicating otherwise, and finally `false` if the invoked function expects a return value.

In the following example, we define `reset()` to alter its behaviour depending on whether it's mixed into root, into another block, or into a return value, as used in the `foo` property below:

```stylus
reset()
  if mixin == 'root'
    got
      root true
  else if mixin
    got 'a mixin'
  else
    'not a mixin'

reset()

body
  reset()
  foo reset()
```

Compiles to:

```css
got {
  root: true;
}
body {
  foo: "not a mixin";
  got: "a mixin";
}
```
