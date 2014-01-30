---
---

<div class="step" markdown="1">

## Transparent mixins

Transparent mixins are unique to Stylus,
and are an incredibly powerful way to enhance your stylesheets. Here all the arguments
passed are simply assigned to three properties. Note that parenthesis
are not required, making it easy to provide cross-browser support
to properties like opacity, border-radius, and even gradients.

<div><textarea class="stylus">
border-radius()
  -webkit-border-radius: arguments
  -moz-border-radius: arguments
  border-radius: arguments

button {
  border-radius: 5px 10px;
}
</textarea></div>
</div>
