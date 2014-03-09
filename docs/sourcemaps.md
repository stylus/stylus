---
layout: default
permalink: docs/sourcemaps.html
---

# Sourcemaps

  Stylus supports basic sourcemaps according to the [Sourcemap v3 spec](https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit)

## Create a sourcemap

  Pass the `--sourcemaps` flag (or `-m`) with a Stylus file. This will create a `style.css` file, and a `style.styl.map` file as siblings to your `style.styl` file and place a sourcemap link at the bottom of `style.css` to your sourcemap.

  `stylus -m style.styl`

  You can also run this command while watching a file. For instance: `stylus -w -m style.styl`. This will update your sourcemap everytime you save.

## Usage with Chrome DevTools

  - Open DevTools
  - Click the Settings cog in the bottom right
  - `Settings > General > Sources > Enable CSS Source Maps`
  - Refresh your page and Inspect an element, in your Elements tab you should see your element attached to `style.styl` rather than the typical `style.css`. Click on this link to jump to the Stylus block used to generate the final CSS.
