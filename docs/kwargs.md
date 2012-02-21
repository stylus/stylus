
## Keyword Arguments

 Stylus supports keyword arguments, or "kwargs". These allow you to reference arguents by their associated parameter name.

 The examples shown below are functionally equivalent. However, we can
 place keyword arguments anywhere within the list. The remaining arguments
 that are _not_ keyed will be applied to the parameters that have not
 been satisfied.

      body {
        color: rgba(255, 200, 100, 0.5);
        color: rgba(red: 255, green: 200, blue: 100, alpha: 0.5);
        color: rgba(alpha: 0.5, blue: 100, red: 255, 200);
        color: rgba(alpha: 0.5, blue: 100, 255, 200);
      }

 Yielding:
 
       body {
         color: rgba(255,200,100,0.5);
         color: rgba(255,200,100,0.5);
         color: rgba(255,200,100,0.5);
         color: rgba(255,200,100,0.5);
       }


 To see what parameters a function or mixin accept, use the `p()` function:
 
    p(rgba)

 Yielding:

    inspect: rgba(red, green, blue, alpha)
