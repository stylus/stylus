---
layout: default
permalink: docs/conditionals.html
---

# Conditionals

Conditionals provide control flow to a language which is otherwise static, providing conditional imports, mixins, functions, and more. The examples below are simply examples, and not recommended :)

## if / else if / else

The `if` conditional works as you would expect, simply accepting an expression, evaluating the following block when `true`. Along with `if` are the typical `else if` and `else` tokens, acting as fallbacks.

The example below would conditionally overload the `padding` property, swapping it for `margin`.

```stylus
overload-padding = true

if overload-padding
  padding(y, x)
    margin y x

body
  padding 5px 10px
```

Another example:

```stylus
box(x, y, margin = false)
  padding y x
  if margin
    margin y x

body
  box(5px, 10px, true)
```
Another `box()` helper:

```stylus
box(x, y, margin-only = false)
  if margin-only
    margin y x
  else
    padding y x
```

## unless

For users familiar with the Ruby programming language, we have the `unless` conditional. It’s basically the opposite of `if`—essentially `if (!(expr))`.

In the example below, if `disable-padding-override` is `undefined` or `false`, `padding` will be overridden, displaying `margin` instead. But if it’s `true`, `padding` will continue outputting `padding 5px 10px` as expected.

```stylus
disable-padding-override = true

unless disable-padding-override is defined and disable-padding-override
  padding(x, y)
    margin y x

body
  padding 5px 10px
```

## Postfix Conditionals

Stylus supports postfix conditionals. This means that `if` and `unless` act as operators; they evaluate the left-hand operand when the right-hand expression is truthy.
  
  
For example let's define `negative()` to perform some basic type checking. Below we use block-style conditionals:
  
```stylus
negative(n)
  unless n is a 'unit'
    error('invalid number')
  if n < 0
    yes
  else
    no
```

Next, we utilize postfix conditionals to keep our function terse.

```stylus
negative(n)
  error('invalid number') unless n is a 'unit'
  return yes if n < 0
  no
```

Of course, we could take this further.  For example, we could write `n < 0 ? yes : no`, or simply stick with booleans: `n < 0`.

Postfix conditionals may be applied to most single-line statements. For example, `@import`, `@charset`, mixins—and of course, properties as shown below:
  
```stylus
pad(types = margin padding, n = 5px)
  padding unit(n, px) if padding in types
  margin unit(n, px) if margin in types

body
  pad()

body
  pad(margin)

body
  apply-mixins = true
  pad(padding, 10) if apply-mixins
```

yielding:

```css
body {
  padding: 5px;
  margin: 5px;
}
body {
  margin: 5px;
}
body {
  padding: 10px;
}
```
