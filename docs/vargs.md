
## Rest Parameters

 Stylus supports rest parameters in the form of `name...`. These params consume the remaining arguments passed to a mixin or function. This is useful for example when utilizing the implicit function call support to apply vendor prefixes like `-webkit` or `-moz`.
 

In the example below we consume all the arguments passed and simply apply them to multiple properties.

     box-shadow(args...)
       -webkit-box-shadow args
       -moz-box-shadow args
       box-shadow args

     #login
       box-shadow 1px 2px 5px #eee

yielding:

      #login {
        -webkit-box-shadow: 1px 2px 5px #eee;
        -moz-box-shadow: 1px 2px 5px #eee;
        box-shadow: 1px 2px 5px #eee;
      }

If we wanted to peek at a specific argument, for example the x-offset we could simply use `args[0]`, or for example we may wish to re-define the mixin:

        box-shadow(offset-x, args...)
          got-offset-x offset-x
          -webkit-box-shadow offset-x args
          -moz-box-shadow offset-x args
          box-shadow offset-x args

        #login
          box-shadow 1px 2px 5px #eee

yielding:

        #login {
          got-offset-x: 1px;
          -webkit-box-shadow: 1px 2px 5px #eee;
          -moz-box-shadow: 1px 2px 5px #eee;
          box-shadow: 1px 2px 5px #eee;
        }

