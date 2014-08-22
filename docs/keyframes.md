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

Yielding:

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

