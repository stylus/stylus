
## @font-face

 The `@font-face` at-rule expects as you would expect, simply followed by a block of properties:
 
 
     @font-face
       font-family Geo
       font-style normal
       src url(fonts/geo_sans_light/GensansLight.ttf)

     .ingeo
       font-family Geo

yielding:


      @font-face {
        font-family: Geo;
        font-style: normal;
        src: url("fonts/geo_sans_light/GensansLight.ttf");
      }
      .ingeo {
        font-family: Geo;
      }

