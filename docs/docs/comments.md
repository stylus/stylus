---
layout: default
permalink: docs/comments.html
---

# Comments

  Stylus supports three kinds of comments: single-line comments, multi-line comments, and multi-line buffered comments.

## Single-line comments

Single-line comments look like JavaScript comments, but are not outputted in the resulting CSS.

```stylus
// I'm a comment!
body
  padding 5px // some awesome padding
```

## Multi-line comments

Multi-line comments look identical to regular CSS comments. However, they are only outputted when the `compress` option is not used.

```stylus
/*
 * Adds the given numbers together.
 */
add(a, b)
  a + b
```

## Multi-line buffered comments

Multi-line comments which are not suppressed start with `/*!`. This tells Stylus to output the comments always, even when the `compress` option is used.

```stylus
/*!
 * Adds the given numbers together.
 */
add(a, b)
  a + b
```
