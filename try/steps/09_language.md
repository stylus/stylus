---
---

<div class="step" markdown="1">

## Robust feature-rich language

Stylus is not just a pre-processor,
it's a flexible and powerful language. Combined with
the concept of transparent mixins you can create robust
cross-browser support, or simply make your life easier
with customized CSS properties as shown below:

<div><textarea class="stylus">
-pos(type, args)
  i = 0
  position: unquote(type)
  {args[i]}: args[i + 1] is a 'unit' ? args[i += 1] : 0
  {args[i += 1]}: args[i + 1] is a 'unit' ? args[i += 1] : 0

absolute()
  -pos('absolute', arguments)

fixed()
  -pos('fixed', arguments)

#prompt
  absolute: top 150px left 5px
  width: 200px
  margin-left: -(@width / 2)

#logo
  fixed: top left
</textarea></div>
</div>
