---
---

<div class="step" markdown="1">

## Interpolation

Interpolation combined with other powerful features
allow you to mold properties and selectors all within
the language itself.

<div><textarea class="stylus">
vendors = webkit moz o ms official

border-radius()
  for vendor in vendors
    if vendor == official
      border-radius: arguments
    else
      -{vendor}-border-radius: arguments
#content
  border-radius: 5px
</textarea></div>
</div>
