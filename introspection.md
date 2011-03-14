
## Introspection API

 Stylus supports an introspection API, allowing mixins and functions to reflect relative to the caller etc.


## mixin

  The `mixin` local variable is automatically assigned within function bodies,
  containing the string "root" indicating the function is called at the root
  level, or "block" indicating otherwise, and finally `false` if the function
  is invoked expecting a return value.

  In the following example we define `reset()` altering its behaviour when mixed in to root, another block, or a return value as used in the `foo` property below. 

      reset()
        if mixin == 'root'
          got
            root true
        else if mixin
          got 'a mixin'
        else
          'not a mixin'

      reset()

      body
        reset()
        foo reset()

compiles to:

        got {
          root: true;
        }
        body {
          foo: "not a mixin";
          got: "a mixin";
        }
