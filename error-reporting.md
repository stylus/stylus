
## Error Reporting

 Stylus has fantastic error reporting built in for syntax, parse, and evaluation errors, complete with stack traces, line numbers, and filenames.

### Syntax Error

 Stylus lets us know the following syntax error, as we have indented to far, providing `6` spaces instead of `4`.

      body
        form input
            padding 5px

yielding:

    Error: /Users/tj/Projects/stylus/testing/test.styl:2
      1: 'body'
      2: '  form input'
      3: '      padding 5px'

    Invalid indentation, got 6 spaces and expected 4

### Parse Error

 Like-wise parse errors are reported in context as well:
 
     body
       form input
         == padding 5px

yielding:

     Error: /Users/tj/Projects/stylus/testing/test.styl:4
       3: '  form input'
       4: '    == padding 5px'

     illegal unary ==

### Evaluation Error

 This "runtime" or evaluation error is caused due to passing a string to `border-radius()` instead of the expected `Unit` by using our helper `ensure(n, 'unit')`.

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

yielding:

      Error: /Users/tj/Projects/stylus/examples/error.styl:12
        11: ''
        12: 'body'
        13: '  border-radius \'5px\''
        14: ''

      expected a unit, but got string
          at ensure() (/Users/tj/Projects/stylus/examples/error.styl:2)
          at border-radius() (/Users/tj/Projects/stylus/examples/error.styl:5)
          at "body" (/Users/tj/Projects/stylus/examples/error.styl:10)
