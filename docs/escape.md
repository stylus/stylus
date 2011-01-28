
## Escaping

 Stylus allows you to escape characters, effectively turning them into identifiers, so that they can be rendered as literals. For example:

     body
       padding 1 \+ 2

will compile to:

     body {
       padding: 1 + 2;
     }


Not that Stylus requires that `/` is parenthesized when used in a property:

    body
      font 14px/1.4
      font (14px/1.4)

yields:

    body {
      font: 14px/1.4;
      font: 10px;
    }