let stylus = require('./')
let fs = require('fs')

let file = 'test/cases/functions.url.styl'

let style = stylus(fs.readFileSync(file, 'utf-8'))
  .set('filename', file)
  .include(__dirname + '/test/images')
  .include(__dirname + '/test/cases/import.basic')
  .define('url', stylus.url())

console.log(style.render())
