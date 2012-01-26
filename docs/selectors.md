## Selectors

### Indentation

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

### Rule Sets

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

### Parent Reference

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

Below is an example providing a simple `2px` border for Internet Exploder utilizing the parent reference within a mixin:

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

### Disambiguation

Expressions such as `padding - n` could be interpreted both as a subtraction operation, as well as a property with an unary minus. To disambiguate, wrap the expression with parens:

    pad(n)
      padding (- n)

    body
      pad(5px)

Compiles to:

    body {
      padding: -5px;
    }

However, this is only true in functions (since functions act both as mixins, or calls with return values). 

For example, the following is fine (and yields the same results as above):

    body
      padding -5px

Have weird property values that Stylus can't process? `unquote()` can help you out:

    filter unquote('progid:DXImageTransform.Microsoft.BasicImage(rotation=1)')

Yields:

    filter progid:DXImageTransform.Microsoft.BasicImage(rotation=1)
    