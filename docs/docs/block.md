---
layout: default
permalink: docs/block.html
---

# @block

You can assign any block of code in Stylus to a variable and then call it, pass as an argument or reuse in any other way.

To define a block, either write it down with an increased indent after an assign sign:

```stylus
foo =
  width: 20px
  height: 20px
```

or use a curly braces syntax with `@block` keyword:

```stylus
foo = @block {
  width: 20px
  height: 20px
}
```

if you would like to render this block anywhere, you could call this variable inside an interpolation, so

```stylus
.icon
  {foo}
```

would render to

```css
.icon {
  width: 20px;
  height: 20px;
}
```

BTW, this is the same way you can use the blocks passed to the [block mixins](mixins.html#block-mixins).

Right now you can only pass the variable as any other variable and render it inside an interpolation. In future we would provide more ways of handling it.
