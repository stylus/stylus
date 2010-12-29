
## Built-in Functions

### red(color)

Return the red component of the given `color`.

     red(#c00)
     // => 204

### green(color)

Return the green component of the given `color`.

     green(#0c0)
     // => 204

### blue(color)

Return the blue component of the given `color`.

     red(#00c)
     // => 204

### hue(color|hsl)

Return the hue of the given `color`.

    hue(hsl(50deg, 100%, 80%))
    // => 50deg

### saturation(color|hsl)

Return the saturation of the given `color`.

    hue(hsl(50deg, 100%, 80%))
    // => 100%

### lightness(color|hsl)

Return the lightness of the given `color`.

    hue(hsl(50deg, 100%, 80%))
    // => 80%

### type(node)

Return type of `node.` as a string.

      type(12)
      // => 'unit'
      
      type(#fff)
      // => 'color'

### hsla(color|hsl|h[, s, l, a])

Convert the given `color` to an `HSLA` node,
or h,s,l,a component values.

     hsla(10deg, 50%, 30%, 0.5)
     // => HSLA

     hsla(#ffcc00)
     // => HSLA

### hsl(color|hsl|h[, s, l])

Convert the given `color` to an `HSLA` node,
or h,s,l component values.

     hsl(10, 50, 30)
     // => HSLA

     hsl(#ffcc00)
     // => HSLA