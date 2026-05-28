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

## `@scope`

Stylus supports modern CSS `@scope` as a normal at-rule:

```stylus
@scope (.root)
  .child
    color: red

@scope (.root) to (.limit)
  .title
    color: blue
```

Would compile to

```css
@scope (.root) {
  .child {
    color: #f00;
  }
}
@scope (.root) to (.limit) {
  .title {
    color: #00f;
  }
}
```

Stylus also keeps its legacy `@scope <selector>` behavior:

```stylus
@scope #sidebar

a
  color: red
```

Would compile to

```css
#sidebar a {
  color: #f00;
}
```

That legacy form works differently from CSS `@scope`: it prefixes subsequent root-level selectors with the given selector, rather than keeping selectors unchanged inside an `@scope` block.

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