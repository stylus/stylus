---
---

<div class="step" markdown="1">

## Color operations

Operations against colors are especially useful.
When adding or subtracting by a percentage the
color lightness may be adjusted, or the hue may
be adjusted with *deg*:


<div><textarea class="stylus">
body
  foo: white - 50%
  foo: black + 50%
  foo: #eee - #f00
  foo: #eee - rgba(black,.5)
  foo: #cc0000 + 30deg
</textarea></div>
</div>
