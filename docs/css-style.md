
## CSS Style

 Stylus transparently supports a regular css-style syntax, meaning you do not need to use an alternative parser, or specify that a certain file is using a specific style.

### Example

 Below is a small style using the indented approach:
 
     border-radius()
       -webkit-border-radius arguments
       -moz-border-radius arguments
       border-radius arguments

     body a
       font 12px/1.4 "Lucida Grande", Arial, sans-serif
       background black
       color #ccc

     form input
       padding 5px
       border 1px solid
       border-radius 5px

 Since braces, colons, and semi-colons are optional, we could write this example just as we would with normal css:
 
     border-radius() {
       -webkit-border-radius: arguments;
       -moz-border-radius: arguments;
       border-radius: arguments;
     }

     body a {
       font: 12px/1.4 "Lucida Grande", Arial, sans-serif;
       background: black;
       color: #ccc;
     }

     form input {
       padding: 5px;
       border: 1px solid;
       border-radius: 5px;
     }

 Since we may mix and match the two variants, the following is valid as well:
 
     border-radius()
       -webkit-border-radius: arguments;
       -moz-border-radius: arguments;
       border-radius: arguments;

     body a {
       font: 12px/1.4 "Lucida Grande", Arial, sans-serif;
       background: black;
       color: #ccc;
     }

     form input
       padding: 5px;
       border: 1px solid;
       border-radius: 5px;

 Variables, functions, mixins, and all of the other features that Stylus provides still work as expected:
 
     main-color = white
     main-hover-color = black

     body a {
       color: main-color;
       &:hover { color: main-hover-color; }
     }

     body a { color: main-color; &:hover { color: main-hover-color; }}

 There are currently a few exceptions to this rule, since the two styles may be mixed and matched some indentation rules still apply. So although not _every_ plain-css stylesheet will work without modification this feature still allows those who prefer css syntax may still utilize the other powerful features provided by Stylus.
 

