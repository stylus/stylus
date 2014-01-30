---
---

<div class="step" markdown="1">

## Operators

Stylus supports all the [operators](docs/operators.html)
you've come to expect from a language, as well as some specific to Stylus.

<div><textarea class="stylus">
body
  foo: 5px + 10
  foo: 2 ** 8
  foo: 5px * 2
  foo: !!''
  foo: foo and bar and baz
  foo: foo or bar or baz
  foo: 1..5
  foo: 1...5
  foo: 'foo' is a 'string'
  foo: (1 2 3) == (1 2 3)
  foo: (1 2 3) == (1 2)
  foo: ((one 1) (two 2)) == ((one 1) (two 2)) 
  foo: ((one 1) (two 2)) == ((one 1) (two)) 
  foo: ((one 1) (two 2))[0]
  foo: 3 in (1 2 3 4)
</textarea></div>
</div>
