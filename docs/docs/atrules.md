---
layout: default
permalink: docs/atrules.html
---

# Other @-rules

Stylus have a basic support for braceless syntax for most of the CSS @-rules, like `@viewport`, `@page`, `@host`, `@supports` and others:

```stylus
@viewport
  color: #00f

@supports (display: flex)
  div
    display: flex

@page :blank
  @top-center
    content: none
```

Would compile to

```css
@viewport {
  color: #00f;
}
@supports (display: flex) {
  div {
    display: flex;
  }
}
@page :blank {
  @top-center {
    content: none;
  }
}
```
## Unknown at-rules

Stylus supports any yet unknown @-rules, so it is future-friendly, as any new at-rules in CSS could be written in indentation-based syntax of Stylus and would be rendered perfectly:

```stylus
@foo
  @bar
    width: 10px

    .baz
      height: 10px
```

Would be compiled to

```css
@foo {
  @bar {
    width: 10px;
    .baz {
      height: 10px;
    }
  }
}
```