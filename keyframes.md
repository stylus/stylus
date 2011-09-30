
## @keyframes

 Stylus supports the `@keyframes` at-rule, which is converted to `@-webkit-keyframes` when compiled:


     @keyframes pulse
       0%
         background-color red
         opacity 1.0
         -webkit-transform scale(1.0) rotate(0deg)
       33%
         background-color blue
         opacity 0.75
         -webkit-transform scale(1.1) rotate(-5deg)
       67%
         background-color green
         opacity 0.5
         -webkit-transform scale(1.1) rotate(5deg)
       100%
         background-color red
         opacity 1.0
         -webkit-transform scale(1.0) rotate(0deg)

yielding:

      @-webkit-keyframes pulse {
        0% {
          background-color: red;
          opacity: 1;
          -webkit-transform: scale(1) rotate(0deg);
        }

        33% {
          background-color: blue;
          opacity: 0.75;
          -webkit-transform: scale(1.1) rotate(-5deg);
        }

        67% {
          background-color: green;
          opacity: 0.5;
          -webkit-transform: scale(1.1) rotate(5deg);
        }

        100% {
          background-color: red;
          opacity: 1;
          -webkit-transform: scale(1) rotate(0deg);
        }

      }

## Expansion

 By utilizing `@keyframes` your rules are automatically expanded to the vendor prefixes defined by the `vendors` variable, defaulting to `webkit moz official`. This means we can alter it at any time for the expansion to take effect immediately. For example consider the following

    @keyframes foo {
      from {
        color: black
      }
      to {
        color: white
      }
    }

expands to our two default vendors and the official syntax:

    @-moz-keyframes foo {
      0% {
        color: #000;
      }

      100% {
        color: #fff;
      }
    }
    @-webkit-keyframes foo {
      0% {
        color: #000;
      }

      100% {
        color: #fff;
      }
    }
    @keyframes foo {
      0% {
        color: #000;
      }

      100% {
        color: #fff;
      }
    }

if we wanted to limit to the official syntax only, simply alter `vendors`:

    vendors = official

    @keyframes foo {
      from {
        color: black
      }
      to {
        color: white
      }
    }

yielding:

    @keyframes foo {
      0% {
        color: #000;
      }

      100% {
        color: #fff;
      }
    }
