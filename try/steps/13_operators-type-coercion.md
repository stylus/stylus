---
---

<div class="step" markdown="1">

## Type coercion

Stylus performs type coercion when appropriate, and
supports all of the unit types you've come to know and love.

<div><textarea class="stylus">
body
  foo: foo + bar
  foo: 'foo ' + bar
  foo: 'foo ' + 'bar'
  foo: 'foo ' + 5px
  foo: 2s - 500ms
  foo: 5000ms == 5s
  foo: 50deg
</textarea></div>
</div>
