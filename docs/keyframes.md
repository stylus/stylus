---
layout: default
permalink: docs/keyframes.html
---

# @keyframes

Stylus supports `@keyframes` both with curly braces or without them, you can also use interpolation both in names or steps of @keyframes:

    $keyframe-name = pulse
    @keyframes {$keyframe-name}
      for i in 0..10
        {10% * i}
          opacity (i/10)

Yielding (expanded prefixes ommited):

    @keyframes pulse {
      0% {
        opacity: 0;
      }
      20% {
        opacity: 0.2;
      }
      40% {
        opacity: 0.4;
      }
      60% {
        opacity: 0.6;
      }
      80% {
        opacity: 0.8;
      }
      100% {
        opacity: 1;
      }
    }

## Expansion

By using `@keyframes`, your rules are automatically expanded to the vendor prefixes defined by the `vendors` variable (default: `moz webkit o ms official`). This means we can alter it at any time for the expansion to take effect immediately. 

**Note that expansion of `@keyframes` to the prefixed at-rules would be removed from the Stylus 1.0 when we'd get to it**
 
For example, consider the following:

    @keyframes foo {
      from {
        color: black
      }
      to {
        color: white
      }
    }

This expands to our three default vendors, and the official syntax:

    @-moz-keyframes foo {
      from {
        color: #000;
      }
      to {
        color: #fff;
      }
    }
    @-webkit-keyframes foo {
      from {
        color: #000;
      }
      to {
        color: #fff;
      }
    }
    @-o-keyframes foo {
      from {
        color: #000;
      }
      to {
        color: #fff;
      }
    }
    @keyframes foo {
      from {
        color: #000;
      }
      to {
        color: #fff;
      }
    }

If we wanted to limit to the official syntax only, simply alter `vendors`:

    vendors = official

    @keyframes foo {
      from {
        color: black
      }
      to {
        color: white
      }
    }

Yielding:

    @keyframes foo {
      from {
        color: #000;
      }
      to {
        color: #fff;
      }
    }
