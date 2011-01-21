
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
