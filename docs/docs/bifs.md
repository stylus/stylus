---
layout: default
permalink: docs/bifs.html
---

# Built-in Functions

## Color Functions

### red(color[, value])

Return the red component of the given `color`, or set the red component to the optional second `value` argument.

```stylus
red(#c00)
// => 204

red(#000, 255)
// => #f00
```

### green(color[, value])

Return the green component of the given `color`, or set the green component to the optional second `value` argument.

```stylus
green(#0c0)
// => 204

green(#000, 255)
// => #0f0
```

### blue(color[, value])

Return the blue component of the given `color`, or set the blue component to the optional second `value` argument.

```stylus
blue(#00c)
// => 204

blue(#000, 255)
// => #00f
```

### alpha(color[, value])

Return the alpha component of the given `color`, or set the alpha component to the optional second `value` argument.

```stylus
alpha(#fff)
// => 1

alpha(rgba(0,0,0,0.3))
// => 0.3

alpha(#fff, 0.5)
// => rgba(255,255,255,0.5)
```

### dark(color)

Check if `color` is dark:

```stylus
dark(black)
// => true

dark(#005716)
// => true

dark(white)
// => false
```

### light(color)

Check if `color` is light:

```stylus
light(black)
// => false

light(white)
// => true

light(#00FF40)
// => true
```

### hue(color[, value])

Return the hue of the given `color`, or set the hue component to the optional second `value` argument.

```stylus
hue(hsl(50deg, 100%, 80%))
// => 50deg

hue(#00c, 90deg)
// => #6c0
```

### saturation(color[, value])

Return the saturation of the given `color`, or set the saturation component to the optional second `value` argument.

```stylus
saturation(hsl(50deg, 100%, 80%))
// => 100%

saturation(#00c, 50%)
// => #339
```

### lightness(color[, value])

Return the lightness of the given `color`, or set the lightness component to the optional second `value` argument.

```stylus
lightness(hsl(50deg, 100%, 80%))
// => 80%

lightness(#00c, 80%)
// => #99f
```
### hsla(color | h,s,l,a)

Convert the given `color` to an `HSLA` node, or h,s,l,a component values.

```stylus
hsla(10deg, 50%, 30%, 0.5)
// => HSLA

hsla(#ffcc00)
// => HSLA
```

### hsl(color | h,s,l)

Convert the given `color` to an `HSLA` node, or h,s,l,a component values.

```stylus
hsl(10, 50, 30)
// => HSLA

hsl(#ffcc00)
// => HSLA
```

### rgba(color | r,g,b,a)

Return `RGBA` from the r,g,b,a channels, or provide a `color` to tweak the alpha.

```stylus
rgba(255,0,0,0.5)
// => rgba(255,0,0,0.5)

rgba(255,0,0,1)
// => #ff0000

rgba(#ffcc00, 0.5)
// rgba(255,204,0,0.5)
```

Alternatively, Stylus supports the `#rgba` and `#rrggbbaa` notations as well:

```stylus
#fc08
// => rgba(255,204,0,0.5)

#ffcc00ee
// => rgba(255,204,0,0.9)
```

### rgb(color | r,g,b)

Return a `RGBA` from the r,g,b channels or cast to an `RGBA` node.

```stylus
rgb(255,204,0)
// => #ffcc00

rgb(#fff)
// => #fff
```

### blend(top[, bottom])

Blends the given `top` color over the `bottom` one using the normal blending. The `bottom` argument is optional, and defaults to `#fff`.

```stylus
blend(rgba(#FFF, 0.5), #000)
// => #808080

blend(rgba(#FFDE00,.42), #19C261)
// => #7ace38

blend(rgba(lime, 0.5), rgba(red, 0.25))
// => rgba(128,128,0,0.625)
```

### lighten(color, amount)

Lighten the given `color` by `amount`. 

This function is unit-sensitive; it supports percentages, for example, as shown here:

```stylus
lighten(#2c2c2c, 30)
// => #787878

lighten(#2c2c2c, 30%)
// => #393939
```

### darken(color, amount)

Darken the given `color` by `amount`.

This function is unit-sensitive; it supports percentages, for example, as shown here:

```stylus
darken(#D62828, 30)
// => #551010

darken(#D62828, 30%)
// => #961c1c
```

### desaturate(color, amount)

Desaturate the given `color` by `amount`.

```stylus
desaturate(#f00, 40%)
// => #c33
```

### saturate(color, amount)

Saturate the given `color` by `amount`.

```stylus
saturate(#c33, 40%)
// => #f00
```

### complement(color)

Gives the complementary color. Equivalent to spinning hue by `180deg`.

```stylus
complement(#fd0cc7)
// => #0cfd42
```

### invert(color)

Inverts the color. The red, green, and blue values are inverted. Opacity is left alone.

```stylus
invert(#d62828)
// => #29d7d7
```

### spin(color, amount)

Spins hue of the given `color` by `amount`.

```stylus
spin(#ff0000, 90deg)
// => #80ff00
```

### grayscale(color)

Gives the grayscale equivalent of the given color. Equivalent to `desaturate(color, 100%)`.

```stylus
grayscale(#fd0cc7)
// => #0cfd42
```

### mix(color1, color2[, amount])

Mix two colors by a given amount. The `amount` is optional and is defaulted to `50%`.


```stylus
mix(#000, #fff, 30%)
// => #b2b2b2
```

### tint(color, amount)

Mix the given color with white.


```stylus
tint(#fd0cc7,66%)
// => #feaceb
```

### shade(color, amount)

Mix the given color with black.

```stylus
shade(#fd0cc7,66%)
// => #560443
```

### luminosity(color)

Returns the [relative luminance](https://www.w3.org/TR/WCAG20/#relativeluminancedef) of the given `color`.

```stylus
luminosity(white)
// => 1

luminosity(#000)
// => 0

luminosity(red)
// => 0.2126
```

### contrast(top[, bottom])

Returns the [contrast ratio](https://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef) object between `top` and `bottom` colors, based on [script](https://github.com/LeaVerou/contrast-ratio/blob/gh-pages/color.js#L108) underlying “[contrast ratio](https://leaverou.github.io/contrast-ratio/)” tool by Lea Verou.

The second argument is optional and is defaulted to `#fff`.

The main key in the returned object is `ratio`, it also have `min` and `max` values that are different from the `ratio` only when the `bottom` color is transparent. In that case the `error` also contains an error margin.

```stylus
contrast(#000, #fff).ratio
// => 21
contrast(#000, rgba(#FFF, 0.5))
// => { "ratio": "13.15;", "error": "-7.85", "min": "5.3", "max": "21" }
```

### transparentify(top[, bottom, alpha])

Returns the transparent version of the given `top` color, as if it was blend over the given `bottom` color (or the closest to it, if it is possible).

The second argument is optional and is defaulted to `#fff`.

The third argument is optional and overrides the autodetected alpha.

```stylus
transparentify(#808080)
// => rgba(0,0,0,0.5)

transparentify(#414141, #000)
// => rgba(255,255,255,0.25)

transparentify(#91974C, #F34949, 0.5)
// => rgba(47,229,79,0.5)
```

## Path Functions

### basename(path[, ext])

Returns the basename of `path`, (optionally) with `ext` extension removed.


```stylus
basename('images/foo.png')
// => "foo.png"

basename('images/foo.png', '.png')
// => "foo"
```

### dirname(path)

Returns the dirname of `path`.

```stylus
dirname('images/foo.png')
// => "images"
```

### extname(path)

Returns the filename extension of `path` including the dot.

```stylus
extname('images/foo.png')
// => ".png"
```

### pathjoin(...)

Peform a path join.

```stylus
pathjoin('images', 'foo.png')
// => "images/foo.png"

path = 'images/foo.png'
ext = extname(path)
pathjoin(dirname(path), basename(path, ext) + _thumb + ext)
// => 'images/foo_thumb.png'
```

## List / Hash Functions

### push(expr, args...)

Push the given `args` to `expr`.

```stylus
nums = 1 2
push(nums, 3, 4, 5)

nums
// => 1 2 3 4 5
```

Aliased as `append()`.

### pop(expr)

Pop a value from `expr`.

```stylus
nums = 4 5 3 2 1
num = pop(nums)

nums
// => 4 5 3 2
num
// => 1
```

### shift(expr)

Shift an element from `expr`.

```stylus
nums = 4 5 3 2 1
num = shift(nums)

nums
// => 5 3 2 1
num
// => 4
```

### unshift(expr, args...)

Unshift the given `args` to `expr`.

```stylus
nums = 4 5
unshift(nums, 3, 2, 1)

nums
// => 1 2 3 4 5
```

Aliased as `prepend()`.

### index(list, value)

Returns the (zero-based) index of `value` within a `list`.

```stylus
list = 1 2 3

index(list, 2)
// => 1

index(1px solid red, red)
// => 2
```

### keys(pairs)

Return keys in the given `pairs`:

```stylus
pairs = (one 1) (two 2) (three 3)
keys(pairs)
// => one two three
```

### values(pairs)

Return values in the given `pairs`:


```stylus
pairs = (one 1) (two 2) (three 3)
values(pairs)
// => 1 2 3
```

### list-separator(list)

Return the separator of the given `list`.

```stylus
list1 = a b c
list-separator(list1)
// => ' '

list2 = a, b, c
list-separator(list2)
// => ','
```

### length([expr])

Parenthesized expressions may act as tuples, the `length()` function returns the length of such expressions.

```stylus
length((1 2 3 4))
// => 4

length((1 2))
// => 2

length((1))
// => 1

length(())
// => 0

length(1 2 3)
// => 3

length(1)
// => 1

length()
// => 0
```

### last(expr)

Return the _last_ value in the given `expr`:

```stylus
nums = 1 2 3
last(nums)
last(1 2 3)
// => 3

list = (one 1) (two 2) (three 3)
last(list)
// => (three 3)
```

## Unit Functions

### typeof(node)

Return type of `node` as a string.

```stylus
type(12)
// => 'unit'

typeof(12)
// => 'unit'

typeof(#fff)
// => 'rgba'

type-of(#fff)
// => 'rgba'
```

Aliased as `type-of` and `type`.

### unit(val[, type])

Return a string indicating the type of `val` or an empty string,
or assign the given `type` without unit conversion.

```stylus
unit(10)
// => ''

unit(15in)
// => 'in'

unit(15%, 'px')
// => 15px

unit(15%, px)
// => 15px
```

### percentage(num)

Convert a `num` to a percentage.

```stylus
percentage(.5)
// => 50%

percentage(4 / 100)
// => 4%
```

## Math Functions

### abs(unit)

```stylus
abs(-5px)
// => 5px

abs(5px)
// => 5px
```
### ceil(unit)

```stylus
ceil(5.5in)
// => 6in
```

### floor(unit)

```stylus
floor(5.6px)
// => 5px
```

### round(unit)

```stylus
round(5.5px)
// => 6px

round(5.4px)
// => 5px
```

**Note:** All rounding functions can accept optional `precision` argument — you can pass the number of digits you want to save after the period:

```stylus
ceil(5.52px,1)
// => 5.6px

floor(5.57px,1)
// => 5.5px

round(5.52px,1)
// => 5.5px
```

### sin(angle)

Returns the value of sine for the given `angle`. If the angle is given as a degree unit, like `45deg`, it is treated as a degree, otherwise it is treated as radians.

```stylus
sin(30deg)
// => 0.5

sin(3*PI/4)
// => 0.707106781
```

### cos(angle)

Returns the value of cosine for the given `angle`. If the angle is given as a degree unit, like `45deg`, it is treated as a degree, otherwise it is treated as radians.

```stylus
cos(180deg)
// => -1
```

### tan(angle)

Returns the value of tangent for the given `angle`. If the angle is given as a degree unit, like `45deg`, it is treated as a degree, otherwise it is treated as radians.

```stylus
tan(45deg)
// => 1

tan(90deg)
// => Infinity
```

### min(a, b)

```stylus
min(1, 5)
// => 1
```

### max(a, b)

```stylus
max(1, 5)
// => 5
```

### even(unit)

```stylus
even(6px)
// => true
```

### odd(unit)

```stylus
odd(5mm)
// => true
```

### sum(nums)

```stylus
sum(1 2 3)
// => 6
```

### avg(nums)

```stylus
avg(1 2 3)
// => 2
```

### range(start, stop[, step])

Returns a list of units from `start` to `stop` (included) by given `step`. 

The `step` argument defaults to `1` if omitted.  It cannot be `0`.

```stylus
range(1, 6)
// equals to `1..6`
// 1 2 3 4 5 6

range(1, 6, 2)
// 1 3 5

range(-6, -1, 2)
// -6 -4 -2

range(1px, 3px, 0.5px)
// 1px 1.5px 2px 2.5px 3px
```

It is most often used in `for` loops:

```stylus
for i in range(10px, 50px, 10)
  .col-{i}
    width: i
```

Yields:

```css
.col-10 {
  width: 10px;
}
.col-20 {
  width: 20px;
}
.col-30 {
  width: 30px;
}
.col-40 {
  width: 40px;
}
.col-50 {
  width: 50px;
}
```

### base-convert(num, base, width)

Returns a `Literal` `num` converted to the provided `base`, padded with `width` zeroes. 

Width defaults to `2`.

```stylus
base-convert(1, 10, 3)
// => 001

base-convert(14, 16, 1)
// => e

base-convert(42, 2)
// => 101010
```

## String Functions

### match(pattern, string[, flags])

Returns any matches of `pattern` (regular expression) in `string`.

```stylus
match('^(height|width)?([<>=]{1,})(.*)', 'height>=1024px')
// => 'height>=1024px' 'height' '>=' '1024px'

match('^foo(?:bar)?', 'foo')
// => 'foo'

match('^foo(?:bar)?', 'foobar')
// => 'foobar'

match('^foo(?:bar)?', 'bar')
// => null

match('ain', 'The rain in SPAIN stays mainly in the plain')
// => 'ain'

match('ain', 'The rain in SPAIN stays mainly in the plain', g)
// => 'ain' 'ain' 'ain'

match('ain', 'The rain in SPAIN stays mainly in the plain', 'gi')
// => 'ain' 'AIN' 'ain' 'ain'
```

### replace(pattern, replacement, val)

Return the string `val`, after replacing with all `pattern` matches with `replacement`.

```stylus
replace(i, e, 'griin')
// => 'green'

replace(i, e, griin)
// => #008000
```

### join(delim, vals...)

Join the given `vals` with `delim`.

```stylus
join(' ', 1 2 3)
// => "1 2 3"

join(',', 1 2 3)
// => "1,2,3"

join(', ', foo bar baz)
// => "foo, bar, baz"

join(', ', foo, bar, baz)
// => "foo, bar, baz"

join(', ', 1 2, 3 4, 5 6)
// => "1 2, 3 4, 5 6"
```

### split(delim, val)

The `split()` method splits a string or ident into a list of strings by separating the string into substrings.

```stylus
split(_, bar1_bar2_bar3)
// => bar1 bar2 bar3

split(_, 'bar1_bar2_bar3')
// => 'bar1' 'bar2' 'bar3'
```

### substr(val, start, length)

The `substr()` method returns the characters in a string beginning at the specified location through the specified number of characters.

```stylus
substr(ident, 1, 2)
// => de

substr('string', 1, 2)
// => 'tr'

val = dredd
substr(substr(val, 1), 0, 3)
// => #f00
```

### slice(val, start[, end])

The `slice()` method extracts a section of a string/list and returns a new string/list.

```stylus
slice('lorem' 'ipsum' 'dolor', 1, 2)
slice('lorem' 'ipsum' 'dolor', 1, -1)
// => 'ipsum'

slice('lorem ipsum', 1, 5)
// => 'orem'
slice(rredd, 1, -1)
// => #f00

slice(1px solid black, 1)
// => solid #000
```

### unquote(str | ident)

Unquote the given `str`, and return it as a `Literal` node.

```stylus
unquote("sans-serif")
// => sans-serif

unquote(sans-serif)
// => sans-serif

unquote('1px / 2px')
// => 1px / 2px
```

### convert(str)

Like `unquote()` but tries to convert the given `str` to a Stylus node.

```stylus
unit = convert('40px')
typeof(unit)
// => 'unit'

color = convert('#fff')
typeof(color)
// => 'rgba'

foo = convert('foo')
typeof(foo)
// => 'ident'
```

### s(fmt, ...)

The `s()` function is similar to `unquote()`, in that it returns a `Literal` node. However, it accepts a format string similar to C's `sprintf()`. 

Currently, the only specifier is `%s`.

```stylus
s('bar()');
// => bar()

s('bar(%s)', 'baz');
// => bar("baz")

s('bar(%s)', baz);
// => bar(baz)

s('bar(%s)', 15px);
// => bar(15px)

s('rgba(%s, %s, %s, 0.5)', 255, 100, 50);
// => rgba(255, 100, 50, 0.5)

s('bar(%Z)', 15px);
// => bar(%Z)

s('bar(%s, %s)', 15px);
// => bar(15px, null)
```

Check out the `%` string operator for equivalent behaviour.


## Utility Functions

### `called-from` property

`called-from` property contains the list of the functions the current function was called from in reverse order (the first item is the deepest function).

```stylus
foo()
  bar()

bar()
  baz()

baz()
  return called-from

foo()
// => bar foo
```

### current-media()

`current-media()` function returns the string of the current block's `@media` rule (or `''` if there is no `@media` above the block).

```stylus
@media only screen and (min-width: 1024px)
  current-media()
// => '@media (only screen and (min-width: (1024px)))'
```

### +cache(keys...)

`+cache` is a really powerful built-in function that allows you to create your own “cachable” mixins.

A “cachable mixin” is one that would apply its contents to the given selector on the first call, but would `@extend` the first call's selector at the second call with the same params.

```stylus
size($width, $height = $width)
  +cache('w' + $width)
    width: $width
  +cache('h' + $height)
    height: $height

.a
  size: 10px 20px
.b
  size: 10px 2em
.c
  size: 1px 2em
```

Would yield to

```css
.a,
.b {
  width: 10px;
}
.a {
  height: 20px;
}
.b,
.c {
  height: 2em;
}
.c {
  width: 1px;
}
```

See how the selectors are grouped together by the used property.

### +prefix-classes(prefix)

Stylus comes with a block mixin `prefix-classes` that can be used for prefixing the classes inside any given Stylus block. For example:

```stylus
+prefix-classes('foo-')
  .bar
    width: 10px
```

Yields:

```css
.foo-bar {
  width: 10px;
}
```

### lookup(name)

Allows looking up the value of a variable called `name`, passed as a string.
Returns `null` if the variable is undefined.

Useful when you need to get a value of a variable with dynamically
generated name:

```stylus
font-size-1 = 10px
font-size-2 = 20px
font-size-3 = 30px

for i in 1..3
  .text-{i}
    font-size: lookup('font-size-' + i)
```

Yields:
```css
.text-1 {
  font-size: 10px;
}
.text-2 {
  font-size: 20px;
}
.text-3 {
  font-size: 30px;
}
```

### define(name, expr[, global])

Allows to create or overwrite a variable with a given `name`, passed as a string, onto current scope (or global scope if `global` is true).

This <abbr title="Built-In Function">BIF</abbr> can be useful in those cases where you need interpolation in variable names:

```stylus
prefix = 'border'
border = { color: #000, length: 1px, style: solid }

for prop, val in border
  define(prefix + '-' + prop, val)

body
  border: border-length border-style border-color
```

yields:

```css
body {
  border: 1px solid #000;
}
```

### operate(op, left, right)

Perform the given `op` on the `left` and `right` operands:

```stylus
op = '+'
operate(op, 15, 5)
// => 20
```

### selector()

Returns the compiled current selector or `&` if called at root level.

```stylus
.foo
  selector()
// => '.foo'

.foo
  &:hover
    selector()
// '.foo:hover'
```

### selector-exists(selector)

Returns true if `selector` exists..

```stylus
.foo
  color red

  a
    font-size 12px

selector-exists('.foo') // true
selector-exists('.foo a') // true
selector-exists('.foo li') // false
selector-exists('.bar') // false
```

This method does not take into account the current context meaning:

```stylus
.foo
  color red

  a
    font-size 12px

  selector-exists('a') // false
  selector-exists(selector() + ' a') // true
```

### opposite-position(positions)

Return the opposite of the given `positions`.

```stylus
opposite-position(right)
// => left

opposite-position(top left)
// => bottom right

opposite-position('top' 'left')
// => bottom right
```

### image-size(path)

Returns the `width` and `height` of the image found at `path`. Lookups are performed in the same manner as `@import`, altered by the `paths` setting.

```stylus
width(img)
  return image-size(img)[0]

height(img)
  return image-size(img)[1]

image-size('tux.png')
// => 405px 250px

image-size('tux.png')[0] == width('tux.png')
// => true
```

### embedurl(path[, encoding])

Returns an inline image as a `url()` literal, encoded with `encoding`. 

(Available encodings: `base64` (default), and `utf8`).

```stylus
background: embedurl('logo.png')
// => background: url("data:image/png;base64,…")

background: embedurl('logo.svg', 'utf8')
// => background: url("data:image/svg+xml;charset=utf-8,…")
```

### add-property(name, expr)

Adds property `name`, with the given `expr` to the closest block.

For example:

```stylus
something()
  add-property('bar', 1 2 3)
  s('bar')

body
  foo: something()
```

yields:

```css
body {
  bar: 1 2 3;
  foo: bar;
}
```

Next, the "magic" `current-property` local variable comes into play. This variable is automatically available to function bodies, and contains an expression with the current property's name, and value.

For example, if we were to inspect this local variable using `p()`, we get the following:

```stylus
p(current-property)
// => "foo" (foo __CALL__ bar baz)

p(current-property[0])
// => "foo"

p(current-property[1])
// => foo __CALL__ bar baz
```

Using `current-property` we can take our example a bit further, and duplicate the property with new values, and a conditional to ensure the function is only used within a property value.

```stylus
something(n)
  if current-property
    add-property(current-property[0], s('-webkit-something(%s)', n))
    add-property(current-property[0], s('-moz-something(%s)', n))
    s('something(%s)', n)
  else
    error('something() must be used within a property')

body {
  foo: something(15px) bar;
}
```

yields:

```css
body {
  foo: -webkit-something(15px);
  foo: -moz-something(15px);
  foo: something(15px) bar;
}
```

If you noticed in the example above, `bar` is only present for the initial call, since we returned `something(15px)`, it remained in-place within the expression, however the others do not take the rest of the expression into account.

Our more robust solution below defines a function named `replace()` which clones the expression to prevent mutation, replaces the string value of an expression with another, and returns the cloned expression. We then move on to replace `__CALL__` within the expressions, which represents the cyclic call to `something()`.

```stylus
replace(expr, str, val)
  expr = clone(expr)
  for e, i in expr
    if str == e
      expr[i] = val
  expr

something(n)
  if current-property
    val = current-property[1]
    webkit = replace(val, '__CALL__', s('-webkit-something(%s)', n))
    moz = replace(val, '__CALL__', s('-moz-something(%s)', n))
    add-property(current-property[0], webkit)
    add-property(current-property[0], moz)
    s('something(%s)', n)
  else
    error('something() must be used within a property')

body
  foo: something(5px) bar baz
```

yields:

```css
body {
  foo: -webkit-something(5px) bar baz;
  foo: -moz-something(5px) bar baz;
  foo: something(5px) bar baz;
}
```

Our implementation is now fully transparent both in regards to the property it is called within, and the position of the call. 

This powerful concept aids in transparent vendor support for function calls, such as gradients.


## Console Functions
 
### warn(msg)

Warn with the given error `msg`. Does not exit.

```stylus
warn("oh noes!")
```

### error(msg)

Exit Stylus with the given error `msg`.

```stylus
add(a, b)
  unless a is a 'unit' and b is a 'unit'
    error('add() expects units')
  a + b
```

### p(expr)

Inspect the given `expr`:

```stylus
fonts = Arial, sans-serif
p('test')
p(123)
p((1 2 3))
p(fonts)
p(#fff)
p(rgba(0,0,0,0.2))

add(a, b)
  a + b

p(add)
```
stdout:

```bash
inspect: "test"
inspect: 123
inspect: 1 2 3
inspect: Arial, sans-serif
inspect: #fff
inspect: rgba(0,0,0,0.2)
inspect: add(a, b)
```

## External File Functions

### json(path[, options])

Convert the JSON file at `path` into Stylus variables or an object. Nested variable object keys are joined with a dash (`-`).

For example, the following sample `media-queries.json` file:

```json
{
    "small": "screen and (max-width:400px)",
    "tablet": {
        "landscape": "screen and (min-width:600px) and (orientation:landscape)",
        "portrait": "screen and (min-width:600px) and (orientation:portrait)"
    }
}
```

May be used in the following ways:

```stylus
json('media-queries.json')

@media small
// => @media screen and (max-width:400px)

@media tablet-landscape
// => @media screen and (min-width:600px) and (orientation:landscape)

vars = json('vars.json', { hash: true })
body
  width: vars.width

vars = json('vars.json', { hash: true, leave-strings: true })
typeof(vars.icon)
// => 'string'

// don't throw an error if the JSON file doesn't exist
optional = json('optional.json', { hash: true, optional: true })
typeof(optional)
// => 'null'
```

### use(path)

You can use any JS-plugin at given `path` with `use()` function right inside your `.styl` files, like this:

```stylus
use("plugins/add.js")

width add(10, 100)
// => width: 110
```

And the `add.js` plugin in this case looks this way:

```js
var plugin = function(){
  return function(style){
    style.define('add', function(a, b) {
      return a.operate('+', b);
    });
  };
};
module.exports = plugin;
```

If you'd like to return any Stylus objects like `RGBA`, `Ident`, or `Unit`, you could use the provided Stylus nodes like this:

```js
var plugin = function(){
  return function(style){
    var nodes = this.nodes;
    style.define('something', function() {
      return new nodes.Ident('foobar');
    });
  };
};
module.exports = plugin;
```

You can pass any options as an optional second argument, using a [hash object](hashes.html):

```js
use("plugins/add.js", { foo: bar })
```

### Undefined Functions

Undefined functions are output as literals. So, for example,
we may call `rgba-stop(50%, #fff)` within our css, and it will
output as you would expect. We can use this within helpers as well.

In the example below we simply define the function `stop()` which
returns the literal `rgba-stop()` call.

```stylus
stop(pos, rgba)
  rgba-stop(pos, rgba)

stop(50%, orange)
// => rgba-stop(50%, #ffa500)
```
