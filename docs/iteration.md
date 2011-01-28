
## Iteration

 Stylus allows you to iterate expressions via the `for/in` construct, taking the form of:
 
      for <val-name> [, <key-name>] in <expression>

For example:

    body
      for num in 1 2 3
        foo num

yields:

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

yielding:

        body {
          foo: 0 Impact;
          foo: 1 Arial;
          foo: 2 sans-serif;
        }

### Functions

 Stylus functions may also contain for-loops, below are some example use-cases:

sum:

      sum(nums...)
        sum = 0
        for n in nums
          sum = sum + n

      sum(1,2,3,4)
      // => 10

join:

      join(delim, strings...)
        buf = ''
        for s, i in strings
          buf = buf + (i ? delim : '') + s

      foo join(', ', 'one', 'two', 'three')
      // => "one, two, three"

      join(' ', 1, 2, 3)
      // => "1 2 3"