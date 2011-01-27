
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
