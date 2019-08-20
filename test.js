var stylus = require('./');


const value = `.test
  font 12px

  a.s tr td:nth-child(n + 1)
    font 10px`;

stylus(value).render((err, css) => {
	console.log(css);
});
