---
layout: default
permalink: docs/functions.html
---

# Functions

Stylus features powerful in-language function definitions. Function definitions appear identical to mixins; however, functions may return a value.

## Return Values

Let's try a trivial example: creating a function that adds two numbers.

```stylus
add(a, b)
  a + b
```

We can then use this function in conditions, in property values, etc.

```stylus
body 
  padding add(10px, 5)
```

Rendering:

```css     
body {
  padding: 15px;
}
```

## Argument Defaults

Optional arguments may default to a given expression. With Stylus we may even default arguments to earlier arguments! 
 
For example:
 
```stylus
add(a, b = a)
  a + b

add(10, 5)
// => 15

add(10)
// => 20
```

**Note:** Since argument defaults are assignments, we can also use function calls for defaults:

```stylus
add(a, b = unit(a, px))
  a + b
```

## Named Parameters

Functions accept named parameters. This frees you from remembering the order of parameters, or simply improves the readability of your code.

For example:

```stylus
subtract(a, b)
  a - b

subtract(b: 10, a: 25)
```

## Function Bodies

We can take our simple `add()` function further. Let's casting all units passed as `px` via the `unit()` built-in. It reassigns each argument, and provides a unit-type string (or identifier), which ignores unit conversion.
 
```stylus
add(a, b = a)
  a = unit(a, px)
  b = unit(b, px)
  a + b

add(15%, 10deg)
// => 25
```

## Multiple Return Values

Stylus functions can return several values—just as you can assign several values to a variable. 
 
For example, the following is a valid assignment:
 
```stylus
sizes = 15px 10px

sizes[0]
// => 15px 
```

Similarly, we may return several values:

```stylus
sizes()
  15px 10px

sizes()[0]
// => 15px
```

One slight exception is when return values are identifiers. For example, the following looks like a property assignment to Stylus (since no operators are present):

```stylus
swap(a, b)
  b a
```

To disambiguate, we can either wrap with parentheses, or use the `return` keyword:

```stylus
swap(a, b)
  (b a)

swap(a, b)
  return b a
```

## Conditionals

Let's say we want to create a function named `stringish()` to determine whether the argument can be transformed to a string. We check if `val` is a string, or an ident (which is string-like). Because undefined identifiers yield themselves as the value, we may compare them to themselves as shown below (where `yes` and `no` are used in place of `true` and `false`):
 
```stylus
stringish(val)
  if val is a 'string' or val is a 'ident'
    yes
  else
    no
```

Usage:

```stylus
stringish('yay') == yes
// => true

stringish(yay) == yes
// => true

stringish(0) == no
// => true
```

__note__: `yes` and `no` are not boolean literals. They are simply undefined identifiers in this case.

Another example:

```stylus
compare(a, b)
  if a > b
    higher
  else if a < b
    lower
  else
    equal
```

Usage:

```stylus
compare(5, 2)
// => higher

compare(1, 5)
// => lower

compare(10, 10)
// => equal
```

## Aliasing

To alias a function, simply assign a function's name to a new identifier. For example, our `add()` function could be aliased as `plus()`, like so:
```stylus
plus = add

plus(1, 2)
// => 3
```
## Variable Functions

In the same way that we can "alias" a function, we can pass a function as well. Here, our `invoke()` function accepts a function, so we can pass it `add()` or `sub()`.

```stylus
add(a, b)
  a + b

sub(a, b)
  a - b

invoke(a, b, fn)
  fn(a, b)

body
  padding invoke(5, 10, add)
  padding invoke(5, 10, sub)
```

Yielding:

```css
body {
  padding: 15;
  padding: -5;
}
```

## Anonymous functions

You can use anonymous functions where needed using `@(){}` syntax. Here is how you could use it to create a custom `sort()` function:

```stylus
sort(list, fn = null)
  // default sort function
  if fn == null
    fn = @(a, b) {
      a > b
    }

  // bubble sort
  for $i in 1..length(list) - 1
    for $j in 0..$i - 1
      if fn(list[$j], list[$i])
        $temp = list[$i]
        list[$i] = list[$j]
        list[$j] = $temp
  return list

  sort('e' 'c' 'f' 'a' 'b' 'd')
  // => 'a' 'b' 'c' 'd' 'e' 'f'

  sort(5 3 6 1 2 4, @(a, b){
    a < b
  })
  // => 6 5 4 3 2 1
```

## arguments

The `arguments` local is available to all function bodies, and contains all the arguments passed. 
 
For example:
 
```stylus
sum()
  n = 0
  for num in arguments
    n = n + num

sum(1,2,3,4,5)
// => 15
```

## Hash Example

Below we define the `get(hash, key)` function, which returns the
value of `key` (or `null`). We iterate each `pair` in `hash`, returning the pair's second node when the first (the `key`) matches. 

```stylus
get(hash, key)
  return pair[1] if pair[0] == key for pair in hash
```

As demonstrated below, in-language functions—paired with robust Stylus expressions—can provide great flexibility:

```stylus
hash = (one 1) (two 2) (three 3)

get(hash, two)
// => 2

get(hash, three)
// => 3

get(hash, something)
// => null
```
