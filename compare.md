
## Implementation Comparisons

Below we go head to head with other implementations.

### Variables

Webkit:

     @var main-color color #006
     color: var(main-color);

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

Webkit

      @mixin pad(size length x, size length y) {
        padding: var(y) var(x);
      }

      .msg {
        @mixin pad(5px, 10px);
      }

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
