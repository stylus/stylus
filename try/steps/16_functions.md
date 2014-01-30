---
---

<div class="step" markdown="1">

## Functions

Stylus functions may be defined in the same manner as mixins,
however their usage differs as they return values. For example
you could define a sum function as shown below:


<div><textarea class="stylus">
sum(nums...)
  n = 0
  n += num for num in nums

body
  foo: sum(1, 2, 3)
</textarea></div>
</div>
