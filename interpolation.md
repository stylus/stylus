
## Interpolation

  Stylus supports interpolation by using the `{}` characters to surround an expression, which then becomes part of the identifier. For example `-webkit-{'border' + '-radius'}` would evaluate to `-webkit-border-radius`.

 A great example use-case for this is expanding properties with vendor prefixes.

      vendor(prop, args)
        -webkit-{prop} args
        -moz-{prop} args
        {prop} args

      border-radius()
        vendor('border-radius', arguments)
      
      box-shadow()
        vendor('box-shadow', arguments)

      button
        border-radius 1px 2px / 3px 4px

yielding:

      button {
        -webkit-border-radius: 1px 2px / 3px 4px;
        -moz-border-radius: 1px 2px / 3px 4px;
        border-radius: 1px 2px / 3px 4px;
      }

## Property Hacks

Interpolation can be used for property hacks as well, since all string values
within the delimiters are transformed to literals. For example:

    body
      {'*foo-bar'} baz

yields:

    body {
      *foo-bar: baz;
    }
      