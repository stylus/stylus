## Literal CSS

 If for any reason Stylus cannot accommodate a specific need, you can always resort to literal css via `@css`:
 
     
     @css {
       body {
         font: 14px;
       }
     }

compiling to:

    body {
      font: 14px;
    }