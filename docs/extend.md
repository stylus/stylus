
## Extend

  The Stylus __@extend__ directive is inspired by, and is essentially the same as the [SASS Implementation](http://sass-lang.com/docs/yardoc/file.SASS_REFERENCE.html#extend), with few subtle differences. This feature makes maintaining semantic rulesets which inherit from others extremely simple.

  While the use of mixins can achieve a similar effect it can to duplicate CSS. A typical pattern is to define several classes as shown below, then combine them on the element such as "warning message". While this technique works just fine, it's difficult to maintain.

      .message,
      .warning {
        padding: 10px;
        border: 1px solid #eee;
      }

      .warning {
        color: #E2E21E;
      }


  To produce this same output with __@extend__ simply pass it the desired selector, Stylus will then append the ".warning" selector to the existing ".message" ruleset so that it inherits its properties as well.

      .message {
        padding: 10px;
        border: 1px solid #eee;
      }

      .warning {
        @extend .message;
        color: #E2E21E;
      }


  The following is a more complex example, showing how __@extend__ cascades:
  
      red = #E33E1E
      yellow = #E2E21E

      .message
        padding: 10px
        font: 14px Helvetica
        border: 1px solid #eee

      .warning
        @extends .message
        border-color: yellow
        background: yellow + 70%

      .error
        @extends .message
        border-color: red
        background: red + 70%

      .fatal
        @extends .error
        font-weight: bold
        color: red

  Yielding the following CSS:
  
      .message,
      .warning,
      .error,
      .fatal {
        padding: 10px;
        font: 14px Helvetica;
        border: 1px solid #eee;
      }
      .warning {
        border-color: #e2e21e;
        background: #f6f6bc;
      }
      .error,
      .fatal {
        border-color: #e33e1e;
        background: #f7c5bc;
      }
      .fatal {
        font-weight: bold;
        color: #e33e1e;
      }

  Where Stylus currently differs from SASS is that SASS will not allow you __@extend__ nested selectors:
  
     form
       button
         padding: 10px

     a.button
       @extend form button 
     Syntax error: Can't extend form button: can't extend nested selectors
             on line 6 of standard input
       Use --trace for backtrace.

   With Stylus as long as the selectors match it'll work:
   
       form
         input[type=text]
           padding: 5px
           border: 1px solid #eee
           color: #ddd

       textarea
         @extends form input[type=text]
         padding: 10px

   Would yield:
   
        form input[type=text],
        form textarea {
          padding: 5px;
          border: 1px solid #eee;
          color: #ddd;
        }
        textarea {
          padding: 10px;
        }
      
