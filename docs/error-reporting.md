---
layout: default
permalink: docs/error-reporting.html
---

# Error Reporting

 Stylus has fantastic error reporting built-in for syntax, parse, and evaluation errors—complete with stack traces, line numbers, and filenames.

## Parse Error

Parse error example:

     body
       form input
         == padding 5px

Yielding:

      ParseError: test.styl:3:16
        1| body
        2|    form input
        3|      == padding 5px
     ---------------------^
        4|

      illegal unary "==", missing left-hand operand

## Evaluation Error

 This "runtime" or evaluation error is caused by passing a string to `border-radius()`, instead of the expected `Unit` (by using our helper `ensure(n, 'unit')`).

      ensure(val, type)
        unless val is a type
          error('expected a ' + type + ', but got ' + typeof(val))

      border-radius(n)
        ensure(n, 'unit')
        -webkit-border-radius n
        -moz-border-radius n
        border-radius n

      body
        border-radius '5px'

Yielding:

      Error: test.styl:3:62
        1| ensure(val, type)
        2|     unless val is a type
        3|       error('expected a ' + type + ', but got ' + typeof(val))
     -------------------------------------------------------------------^
        4|
        5| border-radius(n)
        6|   ensure(n, 'unit')

      expected a unit, but got string
          at ensure() (test.styl:2:17)
          at border-radius() (test.styl:6:16)
          at "body" (test.styl:10:18)
