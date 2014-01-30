---
---

<div class="step" markdown="1">

## Parent reference

The parent reference operator inspired by SASS is also available:

<div><textarea class="stylus">
ul
  li a
    display: block
    color: blue
    padding: 5px
    html.ie &
      padding: 6px
    &:hover
      color: red
</textarea></div>
</div>
