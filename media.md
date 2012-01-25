
## @media

 The `@media` works just as it does within regular CSS, but with Stylus's block notation:

     @media print
       #header
       #footer
         display none

Yielding:

      @media print {
        #header,
        #footer {
          display: none;
        }
      }
