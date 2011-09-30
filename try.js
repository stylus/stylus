
$(function(){
  $('.stylus').each(function(){
    var css = $(this).next('.css').get(0)
      , styl = this;

    $(styl).text($(styl).text().trim());

    styl = CodeMirror.fromTextArea(styl, {
        lineNumbers: true
      , onKeyEvent: render
    });

    css = CodeMirror.fromTextArea(css, {
      lineNumbers: true
    });

    function render() {
      var str = styl.getValue().trim();
      stylus(str)
        .render(function(err, str){
          if (err) return;
          css.setValue(str.trim());
        });
    }

    render();
  });
});