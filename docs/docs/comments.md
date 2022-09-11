---
layout: default
permalink: docs/comments.html
---

# Comments

  Stylus supports three kinds of comments: single-line, and multi-line comments, and multi-line buffered comments.

## Single-line

Single-line comments look like JavaScript comments, and do not output in the resulting CSS:

```stylus
// I'm a comment!
body
  padding 5px // some awesome padding
```

## Multi-line

Multi-line comments look identical to regular CSS comments. However, they only output when the `compress` option is not enabled.

```stylus
/*
 * Adds the given numbers together.
 */
add(a, b)
  a + b
```

## Multi-line buffered

Multi-line comments which are not suppressed start with `/*!`. This tells Stylus to output the comment regardless of compression.

```stylus
/*!
 * Adds the given numbers together.
 */
add(a, b)
  a + b
```
