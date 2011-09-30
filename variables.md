
## Variables

We may assign expressions to variables and use them throughout our stylesheet:

     font-size = 14px

     body
       font font-size Arial, sans-serif

compiles to:

     body {
       font: 14px Arial, sans-serif;
     }

Variables can even consist of an expression list:

    font-size = 14px
    font = font-size "Lucida Grande", Arial

    body
      font font sans-serif

compiles to:

    body {
      font: 14px "Lucida Grande", Arial sans-serif;
    }

identifiers (variable names, functions, etc) may also include the `$` character, for example:

    $font-size = 14px
    body {
      font: $font sans-serif;
    }

## Property Access

 Another cool feature unique to Stylus is the ability to reference
 properties defined in the current block (or target mixin) _without_ assigning their
 values to variables. A great example of this is the logic required
 for vertically and horizontally center an element, which is typically
 done by using percentages and negative margins as shown:

     #logo
       position: absolute
       top: 50%
       left: 50%
       width: w = 150px
       height: h = 80px
       margin-left: -(w / 2)
       margin-top: -(h / 2)

  Instead of assigning the variables `w` and `h` we can simply prepend the `@`
  character to the property name to access the value:

     #logo
       position: absolute
       top: 50%
       left: 50%
       width: 150px
       height: 80px
       margin-left: -(@width / 2)
       margin-top: -(@height / 2)

  Another extremely useful use-case is conditionally defining properties based on the existence of others within mixins. In the following example we apply a default `z-index` of `1`, but _only_ if `z-index` was not previously specified.

      position()
        position: arguments
        z-index: 1 unless @z-index

      #logo
        z-index: 20
        position: absolute

      #logo2
        position: absolute