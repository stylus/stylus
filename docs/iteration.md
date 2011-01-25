
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