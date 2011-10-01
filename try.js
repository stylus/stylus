
var i = 0
  , stylusEditor
  , cssEditor;

function next() {
  var tryme = $('#try')
    , step = $('.step').eq(i)
    , styl = tryme.find('.stylus')
    , css = tryme.find('.css');

  if (i) {
    $('#prev').addClass('show');
  } else {
    $('#prev').removeClass('show');
  }

  if (i == $('.step').length - 1) {
    $('#next').addClass('hide');
  } else {
    $('#next').removeClass('hide');
  }

  ++i;

  function render() {
    var str = stylusEditor.getValue().trim();
    stylus(str)
      .render(function(err, str){
        if (err) return;
        cssEditor.setValue(str.trim());
      });
  }

  if (!stylusEditor) {
    stylusEditor = CodeMirror.fromTextArea(styl.get(0), { onKeyEvent: render });
    cssEditor = CodeMirror.fromTextArea(css.get(0));
  }

  tryme.find('h2').text(step.find('h2').text());
  tryme.find('p:first').text(step.find('p:first').text());
  stylusEditor.setValue(step.find('.stylus').val().trim());

  render();
  return false;
}

function prev() {
  i -= 2;
  next();
  return false;
}

$(function(){
  $('#next').click(next);
  $('#prev').click(prev);
  next();
});
