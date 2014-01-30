---
---

<div class="step" markdown="1">

## Iteration

List [iteration](docs/iteration.html) with Stylus is simple:

<div><textarea class="stylus">
table
  for row in 1 2 3 4 5
    tr:nth-child({row})
      height: 10px * row
</textarea></div>
</div>
