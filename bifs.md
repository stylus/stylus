
## Built-in Functions

### red(color | hsl)

Return the red component of the given `color`.

     red(#c00)
     // => 204

### green(color | hsl)

Return the green component of the given `color`.

     green(#0c0)
     // => 204

### blue(color | hsl)

Return the blue component of the given `color`.

     red(#00c)
     // => 204

### alpha(color | hsl)

Return the alpha component of the given `color`.

      alpha(#fff)
      // => 1
      
      alpha(rgba(0,0,0,0.3))
      // => 0.3

### hue(color | hsl)

Return the hue of the given `color`.

    hue(hsl(50deg, 100%, 80%))
    // => 50deg

### saturation(color | hsl)

Return the saturation of the given `color`.

    hue(hsl(50deg, 100%, 80%))
    // => 100%

### lightness(color | hsl)

Return the lightness of the given `color`.

    hue(hsl(50deg, 100%, 80%))
    // => 80%

### type(node)

Return type of `node.` as a string.

      type(12)
      // => 'unit'
      
      type(#fff)
      // => 'color'

### unit(unit[, type])

Return a string for the type of `unit` or an empty string,
or assign the given `type` without unit conversion.

    unit(10)
    // => ''
    
    unit(15in)
    // => 'in'
    
    unit(15%, 'px')
    // => 15px

### abs(unit)

      abs(-5px)
      // => 5px

      abs(5px)
      // => 5px

### ceil(unit)

      ceil(5.5in)
      // => 6in

### floot(unit)

      floor(5.6px)
      // => 5px

### round(unit)

      round(5.5px)
      // => 6px

      round(5.4px)
      // => 5px

### min(a, b)

      min(1, 5)
      // => 1

### max(a, b)

      max(1, 5)
      // => 5

### even(unit)

      even(6px)
      // => true

### odd(unit)

      odd(5mm)
      // => true

### hsla(color | h[, s, l, a])

Convert the given `color` to an `HSLA` node,
or h,s,l,a component values.

     hsla(10deg, 50%, 30%, 0.5)
     // => HSLA

     hsla(#ffcc00)
     // => HSLA

### hsl(color | h[, s, l])

Convert the given `color` to an `HSLA` node,
or h,s,l component values.

     hsl(10, 50, 30)
     // => HSLA

     hsl(#ffcc00)
     // => HSLA

### rgba(color | r[, g, b, a])

Return a `Color` from the r,g,b,a channels or provide a color to tweak the alpha.

      rgba(255,0,0,0.5)
      // => rgba(255,0,0,0.5)
  
      rgba(255,0,0,1)
      // => #ff0000
  
      rgba(#ffcc00, 0.5)
      // rgba(255,204,0,0.5)

### rgb(color | r[, g, b])

Return a `Color` from the r,g,b channels or cast to a color.
    
    rgb(255,204,0)
    // => #ffcc00
    
    rgb(#fff)
    // => #fff

### lighten(color | hsl, amount)

Lighten the given `color` by `amount`.

    lighten(black, 50%)
    // => #808080

### darken(color | hsl, amount)

Darken the given `color` by `amount`.

    darken(white, 50%)
    // => #808080

### unquote(str | ident)

  Unquote the given `str` and pass through `ident`.
 
       unquote("sans-serif")
       // => sans-serif
 
       unquote(sans-serif)
       // => sans-serif

### operate(op, left, right)

  Perform the given `op` on the `left` and `right` operands:
  
      @op = '+'
      operate(@op, 15, 5)
      // => 20

