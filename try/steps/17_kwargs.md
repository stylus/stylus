---
---

<div class="step" markdown="1">

## Keyword arguments

Keyword arguments are also supported to make
function invocation more expressive, also allowing
you to disregard argument ordering.


<div><textarea class="stylus">
fade-out(color, amount = 50%)
  color - rgba(0,0,0,amount)

body
  foo: fade-out(#eee)
  foo: fade-out(#eee, 20%)
  foo: fade-out(#eee, amount: 50%)
  foo: fade-out(color: #eee, amount: 50%)
  foo: fade-out(amount: 50%, #eee)
  foo: fade-out(amount: 50%, color: #eee)
</textarea></div>
</div>
