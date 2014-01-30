---
---

<div class="step" markdown="1">

## The sprintf operator

The powerful "%" operator when used with strings
behaves like sprintf, with each argument compiled
through the stylus compiler, producing a literal value.

<div><textarea class="stylus">
body
  foo: '%s / %s' % (5px 10px)
  foo: 'MS:WeirdStuff(opacity=%s)' % 1
  foo: unquote('MS:WeirdStuff(opacity=1)')
</textarea></div>
</div>
