---
layout: default
permalink: docs/hashes.html
---

# Hashes

In `0.39.0` version Stylus got hash objects.

## Define

You can define a hash using the curly braces and colons to divide the keys and values:

    foo = {
      bar: baz,
      baz: raz
    }

the keys should be either proper idents or strings:

    foo = {
      bar: baz,
      'baz': raz,
      '0': raz
    }

When you already have a hash, you can set its values using brackets and strings inside:

    foo = {}
    foo['bar'] = baz
    foo['baz'] = raz

Note that while you can't use variables or interpolations in curly braces defines, you can use variables inside brackets:

    foo = {}
    bar = 'baz'
    foo[bar] = raz
    
    foo.baz
    // => raz
    
### Anonymous hash

We can create anonymous hash objects for list, a kind object with out variable name.

    list = foo {int: 1, str: '1'} {node: a-node, color: #32E}

    list[0]
    // => foo
    
    type(list[0])
    // => 'ident'
    
    type(list[1])
    // => 'object'
    
    list[1].int
    // => 1
    
    list[2].color
    // => #32E
    
To access its values, we can use both brackets syntax (`['str']`) and dot syntax (`.`). Brackets syntax works well for programming, meanwhile dot syntax is more readable and JSON-alike syntax. It works well with iteration and conditional statement as well.

## Getters

For retrieving values from hashes you can use the dot for idents:

    foo = { bar: "baz" }

    foo.bar
    // => "baz"

Or brackets with strings for anything:

    foo = { "%": 10 }
    baz = "%"

    foo[baz]
    // => 10

You can use any combinations you want:

    foo = {
      bar: {
        baz: {
          raz: 10px
        }
      }
    }

    qux = "raz"
    foo["bar"].baz[qux]
    // => 10px

## Interpolation

Hashes used inside an interpolation would output the content of the hashes as CSS (without almost any Stylus features though):

    foo = {
      width: 10px,
      height: 20px,
      '&:hover': {
        padding: 0

      }
    }

    .bar
      {foo}

    // => .bar {
    //      width: 10px;
    //      height: 20px;
    //    }
    //    .bar:hover {
    //      padding: 0;
    //    }

## Other stuff

You can use other normal Stylus stuff with hashes, like `length()`:

    foo = { bar: 'a', baz: 'b' }

    length(foo)
    // => 2

You can iterate through hashes with optional key param:

    foo = { width: 10px, height: 20px }

    for key, value in foo
      {key}: value

    // => width: 10px;
    //    height: 20px;

You can check existence of a key in hash using `in`:

    foo = { bar: 10px}

    bar in foo
    // => true

    baz in foo
    // => false

You can get keys or values of the hash using corresponding bifs:

    foo = { bar: 'a', baz: 'b' }

    keys(foo)
    // => 'bar' 'baz'

    values(foo)
    // => 'a' 'b'

You can remove a key from the hash using `remove` bif:

    obj = { foo: 1, bar: 2 }
    remove(obj, 'foo')
    // => {"bar":"(2)"}

And you can use `merge` (aliased as `extend`) to merge hashes:

    obj = {
      foo: 'foo'
      bar: 'bar'
    }

    obj2 = {
      baz: 'baz'
    }

    merge(obj, obj2)
    // => {"foo":"('foo')","bar":"('bar')","baz":"('baz')"}
