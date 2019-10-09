---
layout: default
permalink: docs/lists.html
---

# Lists

Stylus list is a collection of different kind of items. In another word, it is an array, map, list in other programming languages. 

## Syntax
It syntax is similar to CSS syntax for shorthand properties. But it is not completely alike.

### Basic - One-dimensional list
Lists are created like variables, each item is separated by a space `' '` or commas `,`. For the sake of clean code, dentists recommend to only use space character for one-line list. The comma should only use in multi-line list, learn more in [Advance section](#advance---multi-line-list).

**Stylus**

    /**
    * Defining syntax
    * [1] variable-name = item-1 item-2 item-etc
    * [2] variable-name = item-1, item-2, item-etc
    */
    border-items-list = 1px solid #000

    /**
    * Getter syntax
    * (Item's position of list always start at zero)
    * variable-name[item-position]
    */
    div {
        border-width: border-items-list[0]
        border-style: border-items-list[1]
        border-color: border-items-list[2]
    }
    
    // Or like this
    div.no2 {
        border: border-items-list
    }
    

**CSS**

    div {
        border-width: 1px
        border-style: solid
        border-color: #000
    }
    
    // Or like this
    div.no2 {
        border: 1px solid #000
    }

### Above basic - Multidimensional list
Multidimensional list, aka. nest list, is made by `()` or adding various list variables to another variable. Its separator is the same as a single dimension list.

**Stylus**: parentheses style

    /**
    * Multidimensional list: () style
    * morther = (list-0-1 list-0-2 list-0-etc) item-1 (list-etc-1 list-etc-1 list-etc-more)
    */
    mother-list = (1px solid #000) (2px solid #321) none (3px solid #341)

Be aware that `()` operator doesn't create a list, it works as a level-separator. Which means doing this `list = ((x))` doesn't create a multidimensional list with single item, in fact, the `()` will be ignore and the list will be a plain variable `list = x`. Learn more at [Separator ()](#separator-).

**Stylus**: nested variables style

When an empty variable included an list variable, it will be turned into list variable.  
When a value variable included an list variable, it will be turned into a multidimensional list.

    /**
    * Multidimensional list: nested variables style
    * morther = child-list-0 child-1 child-list-etc
    * child-list-0 = 0 1 2 etc
    * child-1 = 'child-variable'
    * child-list-etc = 3 2 1
    */
    mother-list = child-list-0 child-list-1 child-2 child-list-3
    child-list-0 = 1px solid #000
    child-list-1 = 2px solid #321
    child-2 = none
    child-list-3 = 3px solid #341
    
Because of this it can no add another item to list by including it. To add new item, use its [BIF](#bif).
    
**Stylus**: usage

    div {
        border: mother-list[1]
    }
    div.deeper {
        border-color: mother-list[3][2]
    }

**CSS**

    /**
    * No matter what style is used, only one result in return.
    */
    
    div {
        border: 2px solid #321
    }
    div.deeper {
        border-color: #341
    }

    

### Almost advance - Pairing list



### Advance - Multi-line list


## In-action

### Operators

#### Separator ()

#### Subscript []

#### Range .. …

#### Additive: + -

### Iteration

## BIF
BIF stands for Build-in function. Below is a list of BIF for handling list.

- [Push(list, args…)](docs/bifs.html#pushexpr-args) | add
- [unshift(list, args…)](docs/bifs.html#unshiftexpr-args) | add
- [pop(list)](docs/bifs.html#popexpr) | remove
- [shift(list)](docs/bifs.html#shiftexpr) | remove
- [index(list, value)](docs/bifs.html#indexlist-value) | info
- [list-separator(list)](docs/bifs.html#list-separatorlist) | info
- [range(start, stop[, step])](docs/bifs.html#rangestart-stop-step) | generate
- [join(delim, lists/vals…)](docs/bifs.html#joindelim-vals) | convert list -> str
- [split(delim, val)](docs/bifs.html#splitdelim-val) | convert str/ident -> list
