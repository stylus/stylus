
## Rest Parameters

 Stylus supports rest parameters in the form of `name...`. These params consume the remaining arguments passed to a mixin or function. This is useful when utilizing (for example) the implicit function call support to apply vendor prefixes like `-webkit` or `-moz`.
 

In the example below, we consume all the arguments passed, and simply apply them to multiple properties.

     box-shadow(args...)
       -webkit-box-shadow args
       -moz-box-shadow args
       box-shadow args

     #login
       box-shadow 1px 2px 5px #eee

Yielding:

      #login {
        -webkit-box-shadow: 1px 2px 5px #eee;
        -moz-box-shadow: 1px 2px 5px #eee;
        box-shadow: 1px 2px 5px #eee;
      }

If we wanted to peek at a specific argument—say, `x-offset`—we could simply use `args[0]`. Or, we may wish to redefine the mixin:

        box-shadow(offset-x, args...)
          got-offset-x offset-x
          -webkit-box-shadow offset-x args
          -moz-box-shadow offset-x args
          box-shadow offset-x args

        #login
          box-shadow 1px 2px 5px #eee

Yielding:

        #login {
          got-offset-x: 1px;
          -webkit-box-shadow: 1px 2px 5px #eee;
          -moz-box-shadow: 1px 2px 5px #eee;
          box-shadow: 1px 2px 5px #eee;
        }

### arguments

  The `arguments` variable is injected into mixin and function bodies, containing the exact expression passed. This is useful for several reasons (especially vendor support) as you get the _exact_ expression, commas and all.

  For example, if we use a rest param, the comma is consumed (since it is an expression delimiter):
  
      box-shadow(args...)
        -webkit-box-shadow args
        -moz-box-shadow args
        box-shadow args

      #login
        box-shadow #ddd 1px 1px, #eee 2px 2px 

Yielding undesired results:

      #login {
        -webkit-box-shadow: #ddd 1px 1px #eee 2px 2px;
        -moz-box-shadow: #ddd 1px 1px #eee 2px 2px;
        box-shadow: #ddd 1px 1px #eee 2px 2px;
      }

Let's redefine the mixin using `arguments`:

      box-shadow()
        -webkit-box-shadow arguments
        -moz-box-shadow arguments
        box-shadow arguments

      body
        box-shadow #ddd 1px 1px, #eee 2px 2px

Now, yielding the desired result:

      body {
        -webkit-box-shadow: #ddd 1px 1px, #eee 2px 2px;
        -moz-box-shadow: #ddd 1px 1px, #eee 2px 2px;
        box-shadow: #ddd 1px 1px, #eee 2px 2px;
      }

