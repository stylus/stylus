
## @media

 The `@media` works just as it does within regular css, however with Stylus block notation:

     @media print
       #header
       #footer
         display none

yielding:

      @media print {
        #header,
        #footer {
          display: none;
        }
      }
