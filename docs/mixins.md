
## Mixins

Both mixins and functions are defined in the same manor, however they are applied in different ways. For example we have a `border-radius(n)` function defined below, which is invoked as a _mixin_, aka a statement rather than part of an expression.

When `border-radius()` is invoked within a selector, the properties are expanded and copied into the selector.

    border-radius(n)
      -webkit-border-radius n
      -moz-border-radius n
      border-radius n

    form input[type=button]
      border-radius(5px)

compiles to:

    form input[type=button] {
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

Note that the `border-radius` within our mixin is treated as a property, and not a recursive function invocation. To take this further we we may utilize the automatic `arguments` local variable, containing the expression passed, allowing more than one value to be passed:

    border-radius()
      -webkit-border-radius arguments
      -moz-border-radius arguments
      border-radius arguments

now allowing us to pass values such as `border-radius 1px 2px / 3px 4px`.

Another great example of this, is adding transparent support for vendor specifics such as `opacity` support for IE:

        support-for-ie ?= true

        opacity(n)
          opacity n
          if support-for-ie
            filter unquote('progid:DXImageTransform.Microsoft.Alpha(Opacity=' + round(n * 100) + ')')

        #logo
          &:hover
            opacity 0.5

rendering:

        #logo:hover {
          opacity: 0.5;
          filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=50);
        }

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

If we wished, we could invoke `stripe()` as if it were a property:

    stripe #fff #000

### Mixing Mixins in Mixins

 Mixins can of course utilize other mixins, to build up their own selector's and properties. For example, below we create `comma-list()` to inline (via `inline-list()`) and comma-separate an un-ordered list.
 
 
     inline-list()
       li
         display inline

     comma-list()
       inline-list()
       li
         &:after
           content ', '
         &:last-child:after
           content ''

     ul
       comma-list()

rendering:

    ul li:after {
      content: ", ";
    }
    ul li:last-child:after {
      content: "";
    }
    ul li {
      display: inline;
    }

