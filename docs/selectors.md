---
layout: default
permalink: docs/selectors.html
---

# Selectors

## Indentation

Stylus is "pythonic" (i.e. indentation-based). Whitespace is significant, so we substitute `{` and `}` with an _indent_, and an _outdent_ as shown below:

    body
      color white

Which compiles to:

    body {
      color: #fff;
    }

If preferred, you can use colons to separate properties and values:

    body
      color: white

## Rule Sets

Stylus, just like CSS, allows you to define properties for several selectors at once through comma separation.

    textarea, input
      border 1px solid #eee

The same can be done with a newline:

    textarea
    input
      border 1px solid #eee

Both compile to:

    textarea,
    input {
      border: 1px solid #eee;
    }

**The only exception to this rule** are selectors that look like properties. For example, the following `foo bar baz` might be a property **or** a selector:

    foo bar baz
    > input
      border 1px solid

So for this reason (or simply if preferred), we may trail with a comma:

    foo bar baz,
    form input,
    > a
      border 1px solid

## Parent Reference

The `&` character references the parent selector(s). In the example below our two selectors (`textarea` and `input`) both alter the `color` on the `:hover` pseudo selector. 

    textarea
    input
      color #A7A7A7
      &:hover
        color #000

Compiles to:

    textarea,
    input {
      color: #a7a7a7;
    }
    textarea:hover,
    input:hover {
      color: #000;
    }

Below is an example providing a simple `2px` border for Internet Explorer utilizing the parent reference within a mixin:

      box-shadow()
        -webkit-box-shadow arguments
        -moz-box-shadow arguments
        box-shadow arguments
        html.ie8 &,
        html.ie7 &,
        html.ie6 &
          border 2px solid arguments[length(arguments) - 1]

      body
        #login
          box-shadow 1px 1px 3px #eee

Yielding:

      body #login {
        -webkit-box-shadow: 1px 1px 3px #eee;
        -moz-box-shadow: 1px 1px 3px #eee;
        box-shadow: 1px 1px 3px #eee;
      }
      html.ie8 body #login,
      html.ie7 body #login,
      html.ie6 body #login {
        border: 2px solid #eee;
      }

If you'd need to use the ampersand symbol in a selector without it behaving like a parent reference, you can just escape it:

    .foo[title*='\&']
    // => .foo[title*='&']

## Partial Reference

`^[N]` anywhere in a selector, where `N` can be a number, represents a partial reference.

Partial reference works similar to the parent reference, but while parent reference contains the whole selector, partial selectors contain only the first merged `N` levels of the nested selectors, so you could access those nesting levels individually.

The `^[0]` would give you the selector from the first level, the `^[1]` would give you the rendered selector from the second level and so on:

    .foo
      &__bar
        width: 10px

        ^[0]:hover &
          width: 20px

would be rendered as

    .foo__bar {
      width: 10px;
    }
    .foo:hover .foo__bar {
      width: 20px;
    }

Negative values are counting from the end, so ^[-1] would give you the last selector from the chain before `&`:

    .foo
      &__bar
        &_baz
          width: 10px

          ^[-1]:hover &
            width: 20px

would be rendered as

    .foo__bar_baz {
      width: 10px;
    }
    .foo__bar:hover .foo__bar_baz {
      width: 20px;
    }

Negative values are especially helpful for usage inside mixins when you don't know at what nesting level you're calling it.

* * *

Note that partial reference contain the whole rendered chain of selectors until the given nesting level, not the “part” of the selector.

### Ranges in partial references

`^[N..M]` anywhere in a selector, where both `N` and `M` can be numbers, represents a partial reference.

If you'd have a case when you'd need to get the raw part of the selector, or to get the range of parts programmatically, you could use ranges inside partial reference.

If the range would start from the positive value, the result won't contain the selectors of the previous levels and you'd get the result as if the selectors of those levels were inserted at the root of the stylesheet with the combinators omitted:

    .foo
      & .bar
        width: 10px

        ^[0]:hover ^[1..-1]
          width: 20px

would be rendered as

    .foo .bar {
      width: 10px;
    }
    .foo:hover .bar {
      width: 20px;
    }

One number in the range would be the start index, the second — the end index. Note that the order of those numbers won't matter as the selectors would always render from the first levels to the last, so `^[1..-1]` would be equal to the `^[-1..1]`.

When both numbers are equal, the result would be just one raw level of a selector, so you could replace `^[1..-1]` in a previous example to `^[-1..-1]`, and it would be equal to the same last one raw selector, but would be more reliable if used inside mixins.

## Initial Reference

The `~/` characters at the start of a selector can be used to point at the selector at the first nesting and could be considered as a shortcut to `^[0]`. The only drawback is that you can use initial reference only at the start of a selector:

    .block
      &__element
        ~/:hover &
          color: red

Would be rendered as

    .block:hover .block__element {
      color: #f00;
    }

## Relative Reference

The `../` characters at the start of a selector mark a relative reference, which points to the previous to the `&` compiled selector. You can nest relative reference: `../../` to get deeper levels, but note that it can be used only at the start of the selector.

    .foo
      .bar
        width: 10px

        &,
        ../ .baz
          height: 10px

would be rendered as

    .foo .bar {
      width: 10px;
    }
    .foo .bar,
    .foo .baz {
      height: 10px;
    }

Relative references can be considered as shortcuts to the partial references with ranges like `^[0..-(N + 1)]` where the `N` is the number of relative references used.

## Root Reference

The `/` character at the start of a selector is a root reference. It references the root context and this means the selector won't prepend the parent's selector to it (unless you would use it with `&`). It is helpful when you need to write some styles both to some nested selector and to another one, not in the current scope.

    textarea
    input
      color #A7A7A7
      &:hover,
      /.is-hovered
        color #000

Compiles to:

    textarea,
    input {
      color: #a7a7a7;
    }
    textarea:hover,
    input:hover,
    .is-hovered {
      color: #000;
    }

## selector() bif

You can use the built-in `selector()` to get the current compiled selector. Could be used inside mixins for checks or other clever things.

    .foo
      selector()
    // => '.foo'

    .foo
      &:hover
        selector()
    // '.foo:hover'

This bif could also accept an optional string argument, in this case it would return the compiled selector. Note that it wouldn't prepend the selector of the current scope in case it don't have any `&` symbols.

    .foo
      selector('.bar')
    // => '.bar'

    .foo
      selector('&:hover')
    // '.foo:hover'

### Multiple values for `selector()` bif

`selector()` bif can accept multiple values or a comma-separated list in order to create a nested selector structure easier.

    {selector('.a', '.b', '.c, .d')}
      color: red

would be equal to the

    .a
      .b
        .c,
        .d
          color: red

and would be rendered as

    .a .b .c,
    .a .b .d {
      color: #f00;
    }

## selectors() bif

This bif returns a comma-separated list of nested selectors for the current level:

    .a
      .b
        &__c
          content: selectors()

would be rendered as

    .a .b__c {
      content: '.a', '& .b', '&__c';
    }


## Disambiguation

Expressions such as `margin - n` could be interpreted both as a subtraction operation, as well as a property with an unary minus. To disambiguate, wrap the expression with parens:

    pad(n)
      margin (- n)

    body
      pad(5px)

Compiles to:

    body {
      margin: -5px;
    }

However, this is only true in functions (since functions act both as mixins, or calls with return values). 

For example, the following is fine (and yields the same results as above):

    body
      margin -5px

Have weird property values that Stylus can't process? `unquote()` can help you out:

    filter unquote('progid:DXImageTransform.Microsoft.BasicImage(rotation=1)')

Yields:

    filter progid:DXImageTransform.Microsoft.BasicImage(rotation=1)
