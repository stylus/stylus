
## Error Reporting

 Stylus has fantastic error reporting built-in for syntax, parse, and evaluation errors—complete with stack traces, line numbers, and filenames.

### Parse Error

Parse error example:

     body
       form input
         == padding 5px

Yielding:

     Error: /Users/tj/Projects/stylus/testing/test.styl:4
       3: '  form input'
       4: '    == padding 5px'

     illegal unary ==

### Evaluation Error

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

      Error: /Users/tj/Projects/stylus/examples/error.styl:12
        11: ''
        12: 'body'
        13: '  border-radius \'5px\''
        14: ''

      expected a unit, but got string
          at ensure() (/Users/tj/Projects/stylus/examples/error.styl:2)
          at border-radius() (/Users/tj/Projects/stylus/examples/error.styl:5)
          at "body" (/Users/tj/Projects/stylus/examples/error.styl:10)
