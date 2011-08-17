
## Pseudo Elements

  Stylus support for pseudo elements automatically expands
  through the use of the `vendors` variable, defaulting to "webkit",
  "moz", and "official". This means that when you write selectors using
  `::selection` etc they will automatically be expanded to vendor prefixed
  versions.

      p::selection {
        color: white;
        background: black;
      }

  yields:
  
      p::selection,
      p::-moz-selection,
      p::-webkit-selection {
        color: #fff;
        background: #000;
      }
    

  Much like the Stylus __@keyframes__ support you may alter `vendors` at any
  time in order to change this behaviour:

      vendors = webkit

      p::selection {
        color: white;
        background: black;
      }

  yields:
  
      p::selection,
      p::-webkit-selection {
        color: #fff;
        background: #000;
      }
      