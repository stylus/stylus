---
layout: default
permalink: docs/font-face.html
---

# @font-face

The `@font-face` at-rule expects as you would expect. Simply add a block of properties after it, like so:
 
```stylus
@font-face
  font-family Geo
  font-style normal
  src url(fonts/geo_sans_light/GensansLight.ttf)

.ingeo
  font-family Geo
```

Yielding:

```css
@font-face {
  font-family: Geo;
  font-style: normal;
  src: url("fonts/geo_sans_light/GensansLight.ttf");
}
.ingeo {
  font-family: Geo;
}
```