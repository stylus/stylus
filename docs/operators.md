
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
