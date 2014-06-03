---
layout: default
permalink: docs/media.html
---

# @media

 The `@media` queries work just as they do within regular CSS, but with Stylus's block notation:

     @media print
       #header
       #footer
         display none

Yielding:

      @media print {
        #header,
        #footer {
          display: none;
        }
      }
      
## Media Query Bubbling

Media queries can be nested, too, and they will be expanded to wrap the context in which they are used. For example:

    .widget
      padding 10px
      
      @media screen and (min-width: 600px)
        padding 20px

Yielding:

    .widget {
      padding: 10px;
    }
    
    @media screen and (min-width: 600px) {
      .widget {
        padding: 20px;
      }
    }

## Nested media queries

You can nest `@media`s one into another and they would combine into one:

    @media (max-width: 500px)
      .foo
        color: #000

      @media (min-width: 100px), (min-height: 200px)
        .foo
          color: #100

Would yield to

    @media (max-width: 500px) {
      .foo {
        color: #000;
      }
    }
    @media (max-width: 500px) and (min-width: 100px), (max-width: 500px) and (min-height: 200px) {
      .foo {
        color: #100;
      }
    }

## Interpolations and variables

You can use both interpolations and variables inside media queries, so it is possible to do things like this:

    foo = 'width'
    bar = 30em
    @media (max-{foo}: bar)
      body
        color #fff

This would yield

    @media (max-width: 30em) {
      body {
        color: #fff;
      }
    }

It is also possible to use expressions inside MQ:

    .foo
      for i in 1..4
        @media (min-width: 2**(i+7)px)
          width: 100px*i

would yield to

    @media (min-width: 256px) {
      .foo {
        width: 100px;
      }
    }
    @media (min-width: 512px) {
      .foo {
        width: 200px;
      }
    }
    @media (min-width: 1024px) {
      .foo {
        width: 300px;
      }
    }
    @media (min-width: 2048px) {
      .foo {
        width: 400px;
      }
    }
