
## Conditionals

 Conditionals provide control flow to a language which is otherwise static, providing conditional imports, mixins, functions, and more. The examples below are simply examples, and not recommended :)

### if / else if / else

 The `if` conditional works as you would expect, simply accepting an expression, evaluating the following block when `true`. Along with `if` are the typical `else if` and `else` tokens, acting as fallbacks.
 
 The example below would conditionally overload the `padding` property, swapping it for margin.

    overload-padding = true

    if overload-padding
      padding(y, x)
        margin y x

    body
      padding 5px 10px

Another example:

    box(x, y, margin = false)
      padding y x
      if margin
        margin y x

    body
      box(5px, 10px, true)

Another `box()` helper:

    box(x, y, margin-only = false)
      if margin-only
        margin y x
      else
        padding y x

### unless

 For users familiar with the ruby programming language, we have the `unless` conditional, which is essentially the opposite of `if`, essentially `if (!(expr))`.

In the example below, if `disable-padding-override` is undefined or `false` padding will be overridden, displaying `margin` instead. However when `true` padding will remain outputting `padding 5px 10px` as expected.

     disable-padding-override = true

     unless disable-padding-override is defined and disable-padding-override
       padding(x, y)
         margin y x

     body
       padding 5px 10px