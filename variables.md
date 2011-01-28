
## Variables

We may assign expressions to variables and use them throughout our stylesheet:

     font-size = 14px

     body
       font font-size Arial, sans-serif

compiles to:

     body {
       font: 14px Arial, sans-serif;
     }

Variables can even consist of an expression list:

    font-size = 14px
    font = font-size "Lucida Grande", Arial

    body
      font font sans-serif

compiles to:

    body {
      font: 14px "Lucida Grande", Arial sans-serif;
    }