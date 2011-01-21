
## Functions

As mentioned above, functions are defined as before, however they have a return value. Below we define a function named `transparent()` which accepts a color, and defaults alpha to `0.5`. We can then use the `-` operator to substract the given alpha from our left-hand operand, resulting in the same color with lowered transparency. 

    transparent(@color, @alpha = 0.5)
      @color - rgba(0,0,0,@alpha)

    body
      color transparent(#eee)
      background transparent(#eee, 0.2)

compiles to:

    body {
      color: rgba(238,238,238,0.5);
      background: rgba(238,238,238,0.5);
    }

The `return` keyword can be used for early-returns, which otherwise evaluate to the last expression. For example:

    sub(a, b)
      n = a - b

    sub(10, 5)
    // => 5

will return the result of `a` minus `b`, however the following will
return the value of `a`, since it is the last expression.

    sub(a, b)
      n = a - b
      a

    sub(10, 5)
    // => 10

If we introduce the use of `return`, we have an explicit return value:

    sub(a, b)
      return n = a - b
      a

    sub(10, 5)
    // => 5