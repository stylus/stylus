
## Functions

 Stylus features powerful in-language function definition. Function definition appears identical to mixins, however functions may return a value.

### Return Values

 Let's try a trivial example, creating a function that adds two numbers.

    add(a, b)
      a + b

 We may then utilize this function in conditions, as property values, etc.
 
     body 
       padding add(10px, 5)

 Rendering
     
     body {
       padding: 15px;
     }

### Argument Defaults

 Optional arguments may default to a given expression. With Stylus we may even default arguments to leading arguments! For example:
 
 
     add(a, b = a)
       a + b

     add(10, 5)
     // => 15
     
     add(10)
     // => 20

### Function Bodies

 We can take our simple `add()` function further, by casting all units passed as `px` via the `unit()` built-in. Re-assigning each argument and providing a unit type string (or identifier), which disregards unit conversion.
 
     add(a, b = a)
       a = unit(a, px)
       b = unit(b, px)
       a + b

     add(15%, 10deg)
     // => 25
