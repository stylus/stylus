---
layout: default
permalink: docs/literal.html
---

# CSS Literal

 If for any reason Stylus cannot accommodate a specific need, you can always resort to literal CSS with `@css`:
 
     
    @css {
        .ie-opacity {
            filter: progid:DXImageTransform.Microsoft.Alpha(opacity=25);
            -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(opacity=25)";
        }
    }
    
Compiling to:

    .ie-opacity {        
            filter: progid:DXImageTransform.Microsoft.Alpha(opacity=25);
            -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(opacity=25)";
    }
