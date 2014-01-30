## Literal CSS

 If for any reason Stylus cannot accommodate a specific need, you can always resort to literal CSS with `@css`:
 
     
     @css {
       body {
         font: 14px;
       }
     }

Compiling to:

    body {
      font: 14px;
    }