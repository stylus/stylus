
## Escaping

 Stylus allows you to escape characters, effectively turning them into identifiers, so that they can be rendered as literals. For example:

     body
       padding 1 \+ 2

will compile to:

     body {
       padding: 1 + 2;
     }

and:

    body
      font 14px\/1.4

yields:

    body {
      font: 14px/1.4;
    }

_note:_ stylus may special-case '/' in the future