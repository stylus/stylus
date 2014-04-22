# Stylus

This is a branch for the code running Stylus' site. It does not contain the docs, they're taken from the `dev` branch using the git submodule.

## Requirements
- [npm](https://www.npmjs.org/)
- [bundler](//bundler.io/)

## Running locally

Fetch node and ruby dependencies.
```bash
$ npm install
$ bundle install
```

Build the site
```bash
$ make build
```

Serve the site locally
```bash
$ make serve
```

Open [http://0.0.0.0:4000](http://0.0.0.0:4000) in your web browser.
