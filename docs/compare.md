---
layout: default
permalink: docs/compare.html
---

# Implementation Comparisons

Below we go head to head with other implementations.

## Variables

SCSS:

``` scss
$main-color: #006;
color: $main-color;
```

Less:

``` less
@main-color: #006;
color: @main-color;
```

Stylus:

``` stylus
main-color = #006
color: main-color
```

## Mixins

SCSS:

``` scss
@mixin pad($x, $y) {
  padding: $y $x;
}

.msg {
  @include pad(5px, 10px);
}
```

Less:

``` less
.pad(@x, @y) {
  padding: @y @x;
}

.msg {
  .pad(5px, 10px);
}
```

Stylus:

``` stylus
pad(x, y)
  padding: y x

.msg
  pad(5px, 10px)
```

## Complex Example

SCSS:

``` scss
@mixin box-shadow ($x: 0, $y: 0, $blur: 1px, $alpha: 1) {
  $val: $x $y $blur rgba(0, 0, 0, $alpha);
  -webkit-box-shadow: $val;
  -moz-box-shadow:    $val;
  box-shadow:         $val;
}
.box {
  $base: #f938ab;
  color:        saturate($base, 5%);
  border-color: lighten($base, 30%);
  div {
    @include box-shadow(0, 0, 5px, 0.4);
  }
}
```

Less:

``` less
.box-shadow (@x: 0, @y: 0, @blur: 1px, @alpha: 1) {
  @val: @x @y @blur rgba(0, 0, 0, @alpha);
  -webkit-box-shadow: @val;
  -moz-box-shadow:    @val;
  box-shadow:         @val;
}
.box {
  @base: #f938ab;
  color:        saturate(@base, 5%);
  border-color: lighten(@base, 30%);
  div {
    .box-shadow(0, 0, 5px, 0.4);
  }
}
```

Stylus:

``` stylus
box-shadow($x = 0, $y = 0, $blur = 1px, $alpha = 1)
  $val = $x $y $blur rgba(0, 0, 0, $alpha)
  -webkit-box-shadow: $val
  -moz-box-shadow:    $val
  box-shadow:         $val

.box
  base = #f938ab
  color:        saturate(base, 5%)
  border-color: lighten(base, 30%)
  div
    box-shadow: 0 0 5px 0.4
```
