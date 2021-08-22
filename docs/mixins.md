---
layout: default
permalink: docs/mixins.html
---

# Mixins

Both mixins and functions are defined in the same manner, but they are applied in different ways. 

For example, we have a `border-radius(n)` function defined below, which is invoked as a _mixin_ (i.e., invoked as a statement, rather than part of an expression).

When `border-radius()` is invoked within a selector, the properties are expanded and copied into the selector.

    border-radius(n)
      -webkit-border-radius n
      -moz-border-radius n
      border-radius n

    form input[type=button]
      border-radius(5px)

Compiles to:

    form input[type=button] {
      -webkit-border-radius: 5px;
      -moz-border-radius: 5px;
      border-radius: 5px;
    }

When using mixins you can omit the parentheses altogether, providing fantastic transparent vendor property support!

    border-radius(n)
      -webkit-border-radius n
      -moz-border-radius n
      border-radius n

    form input[type=button]
      border-radius 5px

Note that the `border-radius` within our mixin is treated as a property, and not a recursive function invocation. 

To take this further, we can utilize the automatic `arguments` local variable, containing the expression passed, allowing multiple values to be passed:

    border-radius()
      -webkit-border-radius arguments
      -moz-border-radius arguments
      border-radius arguments

Now we can pass values like `border-radius 1px 2px / 3px 4px`!

Also we can make use of the [interpolation](http://stylus-lang.com/docs/interpolation.html) `{param}`:

	border(side, args...)
		if side
			border-{side}  args
		else
			border args
	
	.border-thick
	  border('left' , 10px, 'darkred')
	
	.border
	  border('' , 1px, 'darkred')
	  
Rendering: 
	
	.border-thick {
	  border-left: 10px 'darkred';
	}
	.border {
	  border: 1px 'darkred';
	}

Another great use of this is the addition of transparent support for vendor-specifics—such as `opacity` support for IE:

        support-for-ie ?= true

        opacity(n)
          opacity n
          if support-for-ie
            filter unquote('progid:DXImageTransform.Microsoft.Alpha(Opacity=' + round(n * 100) + ')')

        #logo
          &:hover
            opacity 0.5

Rendering:

        #logo:hover {
          opacity: 0.5;
          filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=50);
        }

## Parent References

 Mixins may utilize the parent reference character `&`, acting on the parent instead of further nesting. 
 
 For example, let's say we want to create a `stripe(even, odd)` mixin for striping table rows. We provide both `even` and `odd` with default color values, and assign the `background-color` property on the row. Nested within the `tr` we use `&` to reference the `tr`, providing the `even` color.
 
     stripe(even = #fff, odd = #eee)
       tr
         background-color odd
         &.even
         &:nth-child(even)
           background-color even

We may then utilize the mixin as shown below:

     table
       stripe()
       td
         padding 4px 10px

     table#users
       stripe(#303030, #494848)
       td
         color white

Alternatively, `stripe()` could be defined without parent references:

    stripe(even = #fff, odd = #eee)
      tr
        background-color odd
      tr.even
      tr:nth-child(even)
        background-color even

If we wished, we could invoke `stripe()` as if it were a property:

    stripe #fff #000

## Block mixins

You can pass blocks to mixins by calling mixin with `+` prefix:

    +foo()
      width: 10px

The passed block would be available inside the mixin as `block` variable, that then could be used with interpolation:

    foo()
      .bar
        {block}

    +foo()
      width: 10px

    => .bar {
         width: 10px;
       }

This feature is in its rough state ATM, but would be enhanced in the future.

## Mixing Mixins in Mixins

 Mixins can (of course!) utilize other mixins, building upon their own selectors and properties. 
 
 For example, below we create `comma-list()` to inline (via `inline-list()`) and comma-separate an unordered list.
 
 
     inline-list()
       li
         display inline

     comma-list()
       inline-list()
       li
         &:after
           content ', '
         &:last-child:after
           content ''

     ul
       comma-list()

Rendering:

    ul li:after {
      content: ", ";
    }
    ul li:last-child:after {
      content: "";
    }
    ul li {
      display: inline;
    }

