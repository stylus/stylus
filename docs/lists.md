---
layout: default
permalink: docs/lists.html
---

# Lists

Stylus list is a collection of different kind of items. In another word, it is an array, map, list in other programming languages. 

## Syntax
It syntax is similar to CSS syntax for shorthand properties. But it is not completely alike.

### Basic - One-dimension list
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


### Advance - Multi-line list


## In-action

### Operators

#### Subscript []

#### Range .. …

#### Additive: + -

### Iteration
