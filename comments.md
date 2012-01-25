
## Comments

  Stylus supports three kinds of comments: single-line, and multi-line comments, and multi-line buffered comments.

## Single-line

  Single-line comments look like JavaScript comments, and do not output in the resulting CSS:

    // I'm a comment!
    body
      padding 5px // some awesome padding

## Multi-line

   Multi-line comments look identical to regular CSS comments. However, they only output when the `compress` option is not enabled.

    /*
     * Adds the given numbers together.
     */
    
    add(a, b)
      a + b

## Multi-line buffered

   Multi-line comments which are not suppressed start with `/*!`. This tells Stylus to output the comment regardless of compression.

    /*!
     * Adds the given numbers together.
     */
    
    add(a, b)
      a + b

