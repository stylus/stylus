---
---

<div class="step" markdown="1">

## Mixins

Stylus [mixins](docs/mixins.html) allow you to define reusable
functionality by defining in-language functions
which can be called from within blocks:

<div><textarea class="stylus">
border-radius(val)
  -webkit-border-radius: val
  -moz-border-radius: val
  border-radius: val
  
button {
  border-radius(5px);
}
</textarea></div>
</div>
