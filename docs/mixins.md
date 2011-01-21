
## Mixins

Both mixins and functions are defined in the same manor, however they are applied in different ways. For example we have a `border-radius(n)` function defined below, which is invoked as a _mixin_, aka a statement rather than part of an expression.

When `border-radius()` is invoked within a selector, the properties are expanded and copied into the selector.

    border-radius(@num)
      -webkit-border-radius @num
      -moz-border-radius @num
      border-radius @num

    form input[type=button]
      border-radius(5px)

compiles to:

    form input[type=button] {
      -webkit-border-radius: 5px;
      -moz-border-radius: 5px;
      -webkit-border-radius: 5px;
      -moz-border-radius: 5px;
      border-radius: 5px;
    }

When utilizing mixins, we can omit the parens all together, providing is with fantastic transparent vendor property support:

    border-radius(n)
      -webkit-border-radius n
      -moz-border-radius n
      border-radius n

    form input[type=button]
      border-radius 5px

Note that the `border-radius` within our mixin is treated as a property, and not a recursive function invocation.

### Parent References

 Mixins may utilize the parent reference character `&`, acting on the parent instead of further nesting. For example lets say we wish to create a `stripe(even, odd)` mixin for striping table row, we provide both `even` and `odd` with default color values, and assign the `background-color` property on the row. Nested within the `tr` we use `&` to reference the `tr`, providing the `even` color.
 
     stripe(even = #fff, odd = #eee)
       tr
         background-color odd
         &.even
         &:nth-child(even)
           background-color even

We may then utilize the mixin as shown below:

     table
       stripe()
       td
         padding 4px 10px

     table#users
       stripe(#303030, #494848)
       td
         color white

Another way to define the `stripe()` mixin without parent reference:

    stripe(even = #fff, odd = #eee)
      tr
        background-color odd
      tr.even
      tr:nth-child(even)
        background-color even
