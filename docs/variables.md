---
layout: default
permalink: docs/variables.html
---

# Variables

We may assign expressions to variables and use them throughout our stylesheet:

     font-size = 14px

     body
       font font-size Arial, sans-serif

Compiles to:

     body {
       font: 14px Arial, sans-serif;
     }

Variables can even consist of an expression list:

    font-size = 14px
    font-stack = "Lucida Grande", Arial, sans-serif

    body
      font font-size font-stack

Compiles to:

    body {
      font: 14px "Lucida Grande", Arial, sans-serif;
    }

Identifiers (variable names, functions, etc.) may also include the `$` character. For example:

    $font-size = 14px
    body {
      font: $font-size sans-serif;
    }

## Property Lookup

 Another cool feature unique to Stylus is the ability to reference
 properties defined _without_ assigning their values to variables. A great example of this is the logic required for vertically and horizontally center an element (typically done using percentages and negative margins, as follows):

     #logo
       position: absolute
       top: 50%
       left: 50%
       width: w = 150px
       height: h = 80px
       margin-left: -(w / 2)
       margin-top: -(h / 2)

  Instead of assigning the variables `w` and `h`, we can simply prepend the `@`
  character to the property name to access the value:

     #logo
       position: absolute
       top: 50%
       left: 50%
       width: 150px
       height: 80px
       margin-left: -(@width / 2)
       margin-top: -(@height / 2)

  Another use-case is conditionally defining properties within mixins based on the existence of others . In the following example, we apply a default `z-index` of `1`—but _only_ if `z-index` was not previously specified:

      position()
        position: arguments
        z-index: 1 unless @z-index

      #logo
        z-index: 20
        position: absolute

      #logo2
        position: absolute

  Property lookup will "bubble up" the stack until found, or return `null` if the property cannot be resolved. In the following example, `@color` will resolve to `blue`:
  
      body
        color: red
        ul
          li
            color: blue
            a
              background-color: @color
