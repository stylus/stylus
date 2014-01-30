## Implementation Comparisons

Below we go head to head with other implementations.

### Variables

SCSS:

     $main-color: #006;
     color: $main-color;

Less:

     @main-color: #006;
     color: @main-color;

Stylus:

     main-color = #006
     color main-color

### Mixins

SCSS:

     @mixin pad($x, $y) {
       padding: $y $x;
     }
   
     .msg {
       @include pad(5px, 10px);
     }

Less:

      .pad(@x, @y) {
        padding: @y @x;
      }
    
      .msg {
        .pad(5px, 10px);
      }

Stylus:

      pad(x, y)
        padding y x

      .msg
        pad(5px, 10px)

### Larger Example

Less:

    .box-shadow (@x: 0, @y: 0, @blur: 1px, @alpha) {
      @val: @x @y @blur rgba(0, 0, 0, @alpha);
      box-shadow:         @val;
      -webkit-box-shadow: @val;
      -moz-box-shadow:    @val;
    }
    .box {
      @base: #f938ab;
      color:        saturate(@base, 5%);
      border-color: lighten(@base, 30%);
      div { .box-shadow(0, 0, 5px, 0.4) }
    }

Stylus:

    box-shadow()
      -webkit-box-shadow arguments
      -moz-box-shadow arguments
      box-shadow arguments

    .box
      base = #f938ab
      color saturate(base, 5%)
      border-color lighten(base, 30%)
      div
        box-shadow 0 0 5px 0.4