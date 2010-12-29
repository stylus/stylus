
## Binary Operators

### Additive: + -

multiplicative and additive binary operators work as expected, and type conversion is applied within unit type classes, or default to the literal value. For example if you perform `5s - 2px` you will get `3s`.

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

### Equality: == >= <= > <

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

## Ternary

The ternary operator works as you would expect in most languages, being the only operator with three operands, the _condition_ expression, the _truth_ expression and the _false_ expression.

    @num = 15
    @num ? unit(@num, 'px') : 20px
    // => 15px