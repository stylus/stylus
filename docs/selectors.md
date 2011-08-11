## Selectors

### Indentation

Stylus is "pythonic" aka indentation-based. Whitespace is significant, so we substitute { and } with an _indent_, and an _outdent_ as shown below:

    body
      color white

which compiles to:

    body {
      color: #fff;
    }

Optionally if preferred we may utilize colons to separate properties and their values:

    body
      color: white

### Rule Sets

Stylus, just like css allows you to define properties for several selectors at once through comma separation.

    textarea, input
      border 1px solid #eee

The same can be done with a newline:

    textarea
    input
      border 1px solid #eee

both compiling to:

    textarea,
    input {
      border: 1px solid #eee;
    }

The one exception to this rule, are selectors that look like properties, for example `foo bar baz` in the following may be a property, or a selector:

    foo bar baz
    > input
      border 1px solid

so for this reason, or if simply preferred we may trail with a comma:

    foo bar baz,
    form input,
    > a
      border 1px solid

### Parent Reference

The `&` character references the parent selector(s). In the example below our two selectors `textarea`, and `input` both alter the `color` on the `:hover` pseudo selector. 

    textarea
    input
      color #A7A7A7
      &:hover
        color #000

compiles to:

    textarea,
    input {
      color: #a7a7a7;
    }
    textarea:hover,
    input:hover {
      color: #000;
    }

below is an example providing a simple `2px` border for internet exploder utilizing the parent reference within a mixin:

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

yielding:

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

Expressions such as `padding - n` could be interpreted both as a subtraction operation, as well as a property with an unary minus. To disambiguate we can wrap the expression with parens:

    pad(n)
      padding (- n)

    body
      pad(5px)

compiles to:

    body {
      padding: -5px;
    }

however this is only true in functions, since functions act both as mixins, or calls with return values. For example this is fine, and will yield the same results as above:

    body
      padding -5px

Have weird property values that Stylus cannot process? `unquote()` can help you out:

    filter unquote('progid:DXImageTransform.Microsoft.BasicImage(rotation=1)')

yields:

    filter progid:DXImageTransform.Microsoft.BasicImage(rotation=1)
    