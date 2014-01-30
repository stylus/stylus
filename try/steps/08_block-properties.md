---
---

<div class="step" markdown="1">

## Block property access

Stylus property access provides easy access to values
defined within the current block. Simply prefix the name
of the property with "@" to reference the value.

<div><textarea class="stylus">
#prompt
  position: absolute
  top: 150px
  left: 50%
  width: 200px
  margin-left: -(@width / 2)
</textarea></div>
</div>
