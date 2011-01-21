
## Functions

 Stylus features powerful in-language function definition. Function definition appears identical to mixins, however functions may return a value.

### Return Values

 Let's try a trivial example, creating a function that adds two numbers.

    add(a, b)
      a + b

 We may then utilize this function in conditions, as property values, etc.
 
     body 
       padding add(10px, 5)

 Rendering
     
     body {
       padding: 15px;
     }

### Argument Defaults

 Optional arguments may default to a given expression. With Stylus we may even default arguments to leading arguments! For example:
 
 
     add(a, b = a)
       a + b

     add(10, 5)
     // => 15
     
     add(10)
     // => 20

### Function Bodies

 We can take our simple `add()` function further, by casting all units passed as `px` via the `unit()` built-in. Re-assigning each argument and providing a unit type string (or identifier), which disregards unit conversion.
 
     add(a, b = a)
       a = unit(a, px)
       b = unit(b, px)
       a + b

     add(15%, 10deg)
     // => 25

Below we define a function named `transparent()` which accepts a color, and defaults alpha to `0.5`. We can then use the `-` operator to substract the given alpha from our left-hand operand, resulting in the same color with lowered transparency. 

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
i
    sub(10, 5)
    // => 10

If we introduce the use of `return`, we have an explicit return value:

    sub(a, b)
      return n = a - b
      a

    sub(10, 5)
    // => 5