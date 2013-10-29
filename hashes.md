## Hashes

In `0.39.0` version Stylus got hash objects.

### Define

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

### Getters

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

### Other stuff

You can use other normal Stylus stuff with hashes, like `length()`:

    foo = { bar: 'a', baz: 'b' }

    length(foo)
    // => 2

You can iterate through hashes with optional key param:

    foo = { width: '10px', height: '20px' }

    for key, value in foo
      {value}: key

    // => width: 10px;
    //    height: 20px;

You can check existance of a key in hash using `in`:

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
