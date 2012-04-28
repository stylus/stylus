## Escaping

 Stylus lets you escape characters. This effectively turns them into identifiers, allowing them to be rendered as literals. 
 
 For example:

     body
       padding 1 \+ 2

Compiles to:

     body {
       padding: 1 + 2;
     }


Note that Stylus requires that `/` is parenthesized when used in a property:

    body
      font 14px/1.4
      font (14px/1.4)

yields:

    body {
      font: 14px/1.4;
      font: 10px;
    }