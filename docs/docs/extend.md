---
layout: default
permalink: docs/extend.html
---

# @extend

The Stylus __@extend__ directive is inspired by (and essentially the same as) the [SASS Implementation](http://sass-lang.com/docs/yardoc/file.SASS_REFERENCE.html#extend), with few subtle differences. This feature significantly simplifies maintenance of semantic rulesets that inherit from other semantic rulesets.


## “Extending” with mixins

Although you can use mixins to achieve a similar effect, this can lead to duplicate CSS. A typical pattern is to define several classes as shown below, then combine them on the element such as "warning message".

While this technique works just fine, it's difficult to maintain.

```css
.message,
.warning {
  padding: 10px;
  border: 1px solid #eee;
}

.warning {
  color: #E2E21E;
}
```

## Using __`@extend`__

To produce this same output with __`@extend`__, simply pass it the desired selector (note that `@extend` and `@extends` are equal, one is just an alias of another).  Stylus will then append the `.warning` selector to the existing `.message` ruleset.  The `.warning` class then inherits properties from `.message`.

```stylus
.message {
  padding: 10px;
  border: 1px solid #eee;
}

.warning {
  @extend .message;
  color: #E2E21E;
}
```

Here's a more complex example, demonstrating how __`@extend`__ cascades:

```stylus
red = #E33E1E
yellow = #E2E21E

.message
  padding: 10px
  font: 14px Helvetica
  border: 1px solid #eee

.warning
  @extends .message
  border-color: yellow
  background: yellow + 70%

.error
  @extends .message
  border-color: red
  background: red + 70%

.fatal
  @extends .error
  font-weight: bold
  color: red
```
  
Yielding the following CSS:

```css
.message,
.warning,
.error,
.fatal {
  padding: 10px;
  font: 14px Helvetica;
  border: 1px solid #eee;
}
.warning {
  border-color: #e2e21e;
  background: #f6f6bc;
}
.error,
.fatal {
  border-color: #e33e1e;
  background: #f7c5bc;
}
.fatal {
  font-weight: bold;
  color: #e33e1e;
}
```

Where Stylus currently differs from SASS is, SASS won't allow  __`@extend`__ nested selectors:

```stylus
form
  button
    padding: 10px

a.button
  @extend form button
Syntax error: Can't extend form button: can't extend nested selectors
        on line 6 of standard input
  Use --trace for backtrace.
```

With Stylus, as long as the selectors match, it works!

```stylus
form
  input[type=text]
    padding: 5px
    border: 1px solid #eee
    color: #ddd

textarea
  @extends form input[type=text]
  padding: 10px
```
   
Yielding:

```css
form input[type=text],
textarea {
  padding: 5px;
  border: 1px solid #eee;
  color: #ddd;
}
textarea {
  padding: 10px;
}
```

## Extending multiple selectors

Stylus allows you to extend multiple selectors at once, just write them with the comma:

```stylus
.a
  color: red

.b
  width: 100px

.c
  @extend .a, .b
  height: 200px
```

Yielding:

```css
.a,
.c {
  color: #f00;
}
.b,
.c {
  width: 100px;
}
.c {
  height: 200px;
}
```
## Extending placeholder selectors

Stylus has a feature similar to the one in [Sass](http://sass-lang.com/docs/yardoc/file.SASS_REFERENCE.html#placeholders) — placeholder selectors.

Those selectors should start with a `$` symbol (for example, `$foo`), and are not yielded in the resulting CSS. But you can still extend them:

```stylus
$foo
  color: #FFF

$foo2
  color: red

.bar
  background: #000
  @extends $foo

.baz
  @extends $foo
```

Yielding:

```css
.bar,
.baz {
  color: #fff;
}
.bar {
  background: #000;
}
```

Note that if the selector is not extended, it won't be in the resulting CSS, so it's a powerful way to create a library of extendable code. While you can insert code through mixins, they would insert the same code every time you use them, while extending placeholders would give you compact output.

## Optional extending

Sometimes it might be usefull to be able to extend something that might or might not exist depending on the context. You can suffix any selector with `!optional` to achieve this:

```stylus
$specialDesign
  color: #FFF

.btn
  @extend .design !optional, $specialDesign !optional
```

Yielding:

```css
.btn {
  color: #fff;
}
```
