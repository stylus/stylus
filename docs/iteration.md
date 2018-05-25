---
layout: default
permalink: docs/iteration.html
---

# Iteration

 Stylus allows you to iterate expressions via the `for/in` construct, taking the form of:
 
      for <val-name> [, <key-name>] in <expression>

For example:

    body
      for num in 1 2 3
        foo num

Yields:

      body {
        foo: 1;
        foo: 2;
        foo: 3;
      }

The example below shows how to use the `<key-name>`:

      body
        fonts = Impact Arial sans-serif
        for font, i in fonts
          foo i font

Yielding:

        body {
          foo: 0 Impact;
          foo: 1 Arial;
          foo: 2 sans-serif;
        }

And here's how you do a regular for loop

    body
      for num in (1..5)
        foo num

Yields:

    body {
      foo: 1;
      foo: 2;
      foo: 3;
      foo: 4;
      foo: 5;
    }
    
Usage with strings:

    for num in (1..10)
      .box{num}
        animation: box + num 5s infinite
      
      @keframes box{num}
        0%   { left: 0px }
        100% { left: (num * 30px) }
              
## Mixins

 We can use iteration within mixins to produce powerful functionality. For example, we can apply expression pairs as properties using interpolation and iteration. 
 
 Below we define `apply()`, conditionally utilizing all the `arguments` so that comma-delimited _and_ expression lists are supported:
 
     apply(props)
       props = arguments if length(arguments) > 1
       for prop in props
         {prop[0]} prop[1]

     body
       apply(one 1, two 2, three 3)

     body
       list = (one 1) (two 2) (three 3)
       apply(list)

## Functions

 Stylus functions may also contain for-loops. Below are some example use-cases:

Sum:

      sum(nums)
        sum = 0
        for n in nums
          sum += n

      sum(1 2 3)
      // => 6

join:

      join(delim, args)
        buf = ''
        for arg, index in args
          if index
            buf += delim + arg
          else
            buf += arg

      join(', ', foo bar baz)
      // => "foo, bar, baz"

## Postfix

 Much like `if` / `unless` may be utilized post-statement, the same can be done with `for`. Below are the same examples as above utilizing the postfix syntax:
 
       sum(nums)
         sum = 0
         sum += n for n in nums


       join(delim, args)
         buf = ''
         buf += i ? delim + arg : arg for arg, i in args

 We can also __return__ from within a loop, below is an example returning the
 number when `n % 2 == 0` evaluates to __true__.
 
     first-even(nums)
       return n if n % 2 == 0 for n in nums

     first-even(1 3 5 5 6 3 2)
     // => 6
