
## Operator Precedence

Below is the operator precedence table, highest to lowest:

     []
     ! ~ + -
     is defined
     ** * / %
     + -
     ... ..
     <= >= < >
     == !=
     is a
     && and || or
     ?:
     = ?=
     not
     if unless

## Unary Operators

The following unary operators are available, `!`, `not`, `-`, `+`, and `~`.

    !0
    // => true
    
    !!0
    // => false

    !1
    // => false
    
    !!5px
    // => true

    -5px
    // => -5px
    
    --5px
    // => 5px

    not true
    // => false
    
    not not true
    // => true
    
The logical `not` operator has low precedence, therefore the following example could be replaced with

    a = 0
    b = 1
    
    !a and !b
    // => false
    // pased as: (!a) and (!b)

with:

    not a or b
    // => false
    // parsed as: not (a or b)

## Binary Operators

### Subscript []

 The subscript operator allows us to grab a value in an expression via index. Parenthesized expressions may act as tuples, so for example `(15px 5px)`, `(1 2 3)`.
 
 Below is an example where we utilize tuples for error handling, showing the versatility of such a construct. As 
 
     add(a, b)
       if a is a 'unit' and b is a 'unit'
         a + b
       else
         (error 'a and b must be units!')

     body
       padding add(1,'5')
       // => padding: error "a and b must be units";
       
       padding add(1,'5')[0]
       // => padding: error;
       
       padding add(1,'5')[0] == error
       // => padding: true;

       padding add(1,'5')[1]
       // => padding: "a and b must be units";

 A more complex example, invoking the `error()` built-in function with the error message returned, when the ident (the first value) equals `error`.
 
 
     if (val = add(1,'5'))[0] == error
       error(val[1])

## Range .. ...

 Both the inclusive (`..`) and exclusive (`...`) range operators are provided, expanding to expressions:
 
     1..5
     // => 1 2 3 4 5

     1...5
     // => 1 2 3 4

### Additive: + -

multiplicative and additive binary operators work as expected, and type conversion is applied within unit type classes, or default to the literal value. For example if we perform `5s - 2px` we will get `3s`.

    15px - 5px
    // => 10px
    
    5 - 2
    // => 3
    
    5in - 50mm
    // => 3.031in
    
    5s - 1000ms
    // => 4s
    
    20mm + 4in
    // => 121.6mm

    "foo " + "bar"
    // => "foo bar"

We can also operator on colors, and values are clamped appropriately.

    #fff - #111
    => #eee
    
    #111 + #fco
    // => #fd1
    
    #fff - rgba(255,0,0,0.3)
    // => rgba(0,255,255,0.7)
    
    #fff / 2
    // => #808080
    
    #fff / rgb(2,0,4)
    // #80ff40

### Multiplicative: / * %

    2000ms + (1s * 2)
    // => 4ms

    5s / 2
    // => 2.5s

    4 % 2
    // => 0

### Exponent: **

The Exponent operator:

    2 ** 8
    // => 256

### Equality: == != >= <= > <

Equality operators can be used to equate units, colors, strings, and even identifiers. This is a powerful concept, as even arbitrary identifiers such as as `wahoo` can be utilized as atoms, a function could return `yes` or `no` instead of `true` or `false` (although not advised). 

    5 == 5
    // => true
    
    10 < 5
    // => true
    
    #fff == #fff
    // => true
    
    true == false
    // => false
    
    wahoo == yay
    // => false
    
    wahoo == wahoo
    // => true
    
    "test" == "test"
    // => true

## Logical Operators: && || and or

Logical operators `&&` and `||` are aliased `and` / `or` which apply the same precedence.

    5 && 3
    // => 3
    
    0 || 5
    // => 5
    
    0 && 5
    // => 0
    
    #fff is a 'color' and 15 is a 'unit'
    // => true

## Conditional Assignment: ?=

The conditional assignment operator `?=` lets us define variables without clobbering old values (when present). This operator expands to an `is defined` binary operation within a ternary, for example the following are equivalent:

    color ?= white
    color = color is defined ? color : white

For example when using `=` we simply re-assign:

    color = white
    color = black
    
    color
    // => black

However when using `?=` our second attempt fails since the variable is already defined:

    color = white
    color ?= black
    
    color
    // => white

## Instance Check: is a

Stylus provides a binary operator named `is a` used to type check. The technical name for unit constructors should be capitalized, however lowercase works as well.

    15 is a unit
    // => true
    
    15 is a Unit
    // => true
    
    #fff is a color
    // => true
    
    15 is a color
    // => false

Alternatively we could use the `type()` BIF:

    type(#fff) == 'color'
    // => true                                                                            

## Variable Definition: is defined

This pseudo binary operator does not accept a right-hand operator, and does _not_ evaluate the left. This allows us to check if a variable has a value assigned to it.

    foo is defined
    // => false
    
    foo = 15px
    foo is defined
    // => true
    
    #fff is defined
    // => 'invalid "is defined" check on non-variable #fff'

Alternatively one can use the `lookup(name)` built-in function to do this, or to perform dynamic lookups:

    name = 'blue'
    lookup('light-' + name)
    // => null
    
    light-blue = #80e2e9
    lookup('light-' + name)
    // => #80e2e9

## Ternary

The ternary operator works as we would expect in most languages, being the only operator with three operands, the _condition_ expression, the _truth_ expression and the _false_ expression.

    num = 15
    num ? unit(num, 'px') : 20px
    // => 15px