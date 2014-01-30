---
layout: default
permalink: docs/media.html
---

# @media

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
      
## Media Query Nesting

Media queries can be nested, too, and they will be expanded to wrap the context in which they are used. For example:

    .widget
      padding 10px
      
      @media screen and (min-width: 600px)
        padding 20px

Yielding:

    .widget {
      padding: 10px;
    }
    
    @media screen and (min-width: 600px) {
      .widget {
        padding: 20px;
      }
    }
